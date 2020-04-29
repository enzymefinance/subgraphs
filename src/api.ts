import { Context } from './context';

export class AbstractionLayer {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  // TODO: Add abstraction methods here that use the branch information
  // from the context for making contract calls and formatting return
  // values in a uniform way.
}
