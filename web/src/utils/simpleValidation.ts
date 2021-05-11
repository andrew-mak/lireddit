type valuesObject = {
  [key: string]: any;
}

type validationRules = {
  [key: string]: {
    required?: boolean,
    minLength?: number
  }
}

export const simpleValidation = (rules: validationRules, values: valuesObject) => {
  const errors = {} as valuesObject;

  for (const key in values) {

    if (rules[key]['required'] && !values[key]) {
      errors[key] = "Please, enter something.";
      return errors
    }
    if (rules[key]['minLength']) {
      if (values[key].trim().length < rules[key]['minLength']!) {
        errors[key] = `Must be more than ${rules[key]['minLength']} nonspace characters`;
        return errors
      }
    }
  }

  return errors;
};
