import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import {
  toBigDecimal,
  tokenBalance,
  tokenDecimals,
  tokenName,
  tokenSymbol,
  ZERO_ADDRESS,
} from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/ERC20Contract';
import { Asset, Holding, IgnoreAsset, IncomingTransfer, OutgoingTransfer, Vault } from '../generated/schema';

export function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function handleTransfer(event: Transfer): void {
  // Ignore fee share transfers. They are first minted for the vault itself (first case) and
  // then transferred to the manager when they are claimed (second case).
  // NOTE: If we ever want to support a fund buying shares of itself (apparently that's
  // a thing in TradFi), then we have to reconsider this.
  if (event.params.to.equals(event.address) || event.params.from.equals(event.address)) {
    return;
  }

  // If the to or from address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a burn or mint operation for instance.
  let to = (event.params.to.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.to.toHex())) as Vault | null;
  let from = (event.params.from.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.from.toHex())) as Vault | null;

  // Bail out early if neither `from` nor `to` are a vault.
  // NOTE: There is a possibility, that a token is transferred to a future vault address
  // before it is even created. We knowingly ignore this case here.
  if (to == null && from == null) {
    return;
  }

  // Ensure that this is a valid asset.
  let asset = ensureAsset(event.address) as Asset;
  if (asset == null) {
    return;
  }

  // Record the case where the recipient is a vault.
  if (to != null) {
    handleIncomingTransfer(event, asset, to as Vault);
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    handleOutgoingTransfer(event, asset, from as Vault);
  }
}

function handleIncomingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
  let from = event.params.from.toHex();
  let holding = updateHolding(vault, asset, event.block.timestamp);
  let amount = toBigDecimal(event.params.value, asset.decimals);

  let transfer = new IncomingTransfer(transferId(event, 'incoming'));
  transfer.type = 'IN';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.holding = holding.id;
  transfer.balance = holding.balance;
  transfer.amount = amount;
  transfer.sender = from;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = event.transaction.hash.toHex();
  transfer.save();
}

function handleOutgoingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
  let to = event.params.to.toHex();
  let holding = updateHolding(vault, asset, event.block.timestamp);
  let amount = toBigDecimal(event.params.value, asset.decimals);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.type = 'OUT';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.holding = holding.id;
  transfer.balance = holding.balance;
  transfer.amount = amount;
  transfer.recipient = to;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = event.transaction.hash.toHex();
  transfer.save();
}

function ensureAsset(address: Address): Asset | null {
  let id = address.toHex();
  let asset = Asset.load(id) as Asset;

  if (asset == null) {
    let ignore = IgnoreAsset.load(id);
    if (ignore != null) {
      log.error('ignoring asset {} (blacklisted)', [id]);
      return null;
    }

    // Check if we can call .decimals() on this contract.
    let decimals = tokenDecimals(address);
    if (decimals == -1) {
      log.error('ignoring asset {} (cannot fetch decimals)', [id]);

      let ignore = new IgnoreAsset(id);
      ignore.save();

      return null;
    }

    // Check if we can call .balanceOf() on this contract.
    let vitalik = Address.fromString('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
    let balance = tokenBalance(address, vitalik);
    if (balance == null) {
      log.error('ignoring asset {} (cannot fetch balances)', [id]);

      let ignore = new IgnoreAsset(id);
      ignore.save();

      return null;
    }

    let name = tokenName(address);
    let symbol = tokenSymbol(address);

    asset = new Asset(id);
    asset.name = name;
    asset.symbol = symbol;
    asset.decimals = decimals;
    asset.total = BigDecimal.fromString('0');
    asset.save();
  }

  return asset;
}

function updateHolding(vault: Vault, asset: Asset, timestamp: BigInt): Holding {
  let id = vault.id + '/' + asset.id;
  let holding = Holding.load(id) as Holding;

  if (holding == null) {
    holding = new Holding(id);
    holding.asset = asset.id;
    holding.vault = vault.id;
    holding.balance = BigDecimal.fromString('0');
  }

  let vaultAddress = Address.fromString(vault.id);
  let assetAddress = Address.fromString(asset.id);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(assetAddress, vaultAddress);
  let currentBalance =
    balanceOrNull == null ? BigDecimal.fromString('0') : toBigDecimal(balanceOrNull as BigInt, asset.decimals);
  let previousBalance = holding.balance;

  // Update the vault balance.
  holding.balance = currentBalance;
  holding.updated = timestamp;
  holding.save();

  // Update the total value locked (in the entire network) of this asset.
  asset.total = asset.total.minus(previousBalance).plus(currentBalance);
  asset.save();

  return holding;
}
