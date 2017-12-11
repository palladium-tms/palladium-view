import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Directive({
  selector: '[validateEqual][formControlName],[validateEqual][formControl],[validateEqual][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidator), multi: true }
  ]
})
export class EqualValidator implements Validator {
  constructor( @Attribute('validateEqual') public validateEqual: string) {}

  validate(password: AbstractControl): { [key: string]: any } {
      const retype_pass = password.root.get(this.validateEqual);
      if (retype_pass !== null) {
        if (password.value === retype_pass.value) {
          password.root.get('confirmPassword').setErrors( null);
          password.root.get('password').setErrors( null);
          return null;
        } else {
          password.root.get('confirmPassword').setErrors( {validateEqual: false} );
          password.root.get('password').setErrors( {validateEqual: false});
          return {validateEqual: false};
        }
      }
    return {test: true};
  }
}
