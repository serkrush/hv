export enum CheckError {
  DontMatch = "dont-match",
  InvalidLength = "invalid-length",
  InvalidCases = "invalid-cases",
  DigitRequire = "digit-require",
}

export const checkOnePasswordFormat = (
  password,
  onError: (error: CheckError) => void
) => {
  if (password.length < 8) {
    onError(CheckError.InvalidLength);
    return false;
  }
  var re = {
    capital: /[A-Z]/,
    small: /[a-z]/,
    digit: /[0-9]/,
  };

  if (!re.capital.test(password) || !re.small.test(password)) {
    onError(CheckError.InvalidCases);
    return false;
  }

  if (!re.digit.test(password)) {
    onError(CheckError.DigitRequire);
    return false;
  }

  return true;
};

const checkPasswordFormat = (
  password,
  confirmPassword,
  onError: (error: CheckError) => void
) => {
  if (password !== confirmPassword) {
    onError(CheckError.DontMatch);
    return false;
  }

  if (password.length < 8) {
    onError(CheckError.InvalidLength);
    return false;
  }
  var re = {
    capital: /[A-Z]/,
    small: /[a-z]/,
    digit: /[0-9]/,
  };

  if (!re.capital.test(password) || !re.small.test(password)) {
    onError(CheckError.InvalidCases);
    return false;
  }

  if (!re.digit.test(password)) {
    onError(CheckError.DigitRequire);
    return false;
  }

  return true;
};

export default checkPasswordFormat;
