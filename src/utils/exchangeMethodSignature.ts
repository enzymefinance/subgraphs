export function exchangeMethodSignatureToName(signature: string): string {
  if (
    signature == '0xe51be6e8f1c20394ac4bc9b52300bea4a3697c14c468087e25e8b916b34aa373' ||
    signature == '0x63b24ef16a53e72cf86df77b945c3df557856c9242e884ebde6ac363609c3906'
  ) {
    return 'takeOrder';
  }

  if (signature == '0x79705be7d675563c1e2321f67e8b325f7dd168f51975b104d5f4588cf7e82725' || signature == '') {
    return 'makeOrder';
  }

  if (signature == '0x613466791ec33946b8819ce34672fed07c05cbddfd8152db7f548a582612dde9') {
    return 'cancelOrder';
  }

  return '';
}
