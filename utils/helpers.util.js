const nameList = [
  'Alce;o',
  'Baleia;a',
  'Cabra;a',
  'Dragão;o',
  'Elefante;o',
  'Girafa;a',
  'Hipopótamo;o',
  'Iguana;a',
];
const lastNameList = [
  'Alegre',
  'Bonit?',
  'Curios?',
  'Dorminhoc?',
  'Elegante',
  'Gigante',
  'Heróic?',
  'Indelicad?',
];

const randomNameGenerator = () => {
  const name = nameList[Math.floor(Math.random() * nameList.length)];
  const lastName = lastNameList[Math.floor(Math.random() * nameList.length)];
  return `${name.split(';')[0]} ${lastName.replace('?', name.split(';')[1])}`;
};

module.exports = {
  randomNameGenerator,
};
