export type DomainExceptionKind =
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED';

export abstract class DomainException extends Error {
  abstract readonly kind: DomainExceptionKind;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
