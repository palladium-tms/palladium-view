import { FormControl, ValidatorFn } from "@angular/forms"

interface ObjectWithName {
    name: string
}

export function validateNameExists(objects: ObjectWithName[]): ValidatorFn {
  return (control: FormControl) => {
    return !objects.some(obj => obj.name == control.value) ? null : {
      validateNameExists: {
        valid: false,
      }
    }
  }
}
