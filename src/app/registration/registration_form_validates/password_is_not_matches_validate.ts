import { FormGroup} from '@angular/forms';

export function ValidatePassword(form: FormGroup) {
  const password = form.controls.pwd.value;
  const confirmpwd = form.controls.confirmpwd.value;
  if (password !== confirmpwd) {
    form.controls.confirmpwd.setErrors( {MatchPassword: true} )
  } else {
    return null
  }
}
