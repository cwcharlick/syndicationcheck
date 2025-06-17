export const compareStrings = (stringA, stringB) => {
  if (!stringA || !stringB) return false;
  return wordMatch(stringA, stringB) || wordMatch(stringB, stringA);
};

const wordMatch = (stringA, stringB) => {
  const stringAWords = stringA.split(" ");
  const biggestStringAWord = stringAWords.reduce(
    (a, v) => (v.length > a.length ? v : a),
    stringAWords[0]
  );
  let stringAFilteredWords = stringAWords.filter((el) => el.length > 3);
  if (stringAFilteredWords.length === 0)
    stringAFilteredWords = [biggestStringAWord];

  for (let i = 0; i < stringAFilteredWords.length; i++) {
    if (stringB.toUpperCase().includes(stringAFilteredWords[i].toUpperCase()))
      return true;
  }

  return false;
};

export const removeBrandFromProduct = (product, brand) => {
  const brandWords = brand.split(" ");
  const productWords = product.split(" ");

  const keep = [];

  productWords.forEach((pw) => {
    if (!brandWords.includes(pw)) keep.push(pw);
  });

  return keep.join(" ");
};
