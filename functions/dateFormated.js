const dateFormated = (dataDeCriacao) => {
  let meridium;
  if (dataDeCriacao.getHours() >= 12) {
    meridium = 'PM';
  } else {
    meridium = 'AM';
  }
  let [month, date, year] = dataDeCriacao.toLocaleDateString('en-US').split('/');
  month = (`00${month}`).slice(-2);
  date = (`00${date}`).slice(-2);
  year = `${year} `.trim();
  const [hour, minute, second] = dataDeCriacao.toLocaleTimeString('en-US').split(/:| /);
  return `${date}-${month}-${year} ${hour}:${minute}:${second} ${meridium}`;
  //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  //  https://pt.stackoverflow.com/questions/175662/fun%C3%A7%C3%A3o-javascript-que-complete-o-campo-com-zeros-%C3%A0-esquerda
};

module.exports = dateFormated;
