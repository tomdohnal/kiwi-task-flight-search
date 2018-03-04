import Router from 'next/router';

// parses to YYYY-MM-DD format (e. g. 2018-02-28)
export const parseToKiwiDate = date => (
  `${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}-${(`0${date.getDate()}`).slice(-2)}`
);

// parses from to YYYY-MM-DD format (e. g. 2018-02-28) MM/DD/YYYY format (e. g. 02/28/2018)
export const parseKiwiDateToStandardDate = (kiwiDate) => {
  const kiwiDateChunks = kiwiDate.split('-');

  return `${kiwiDateChunks[1]}/${kiwiDateChunks[2]}/${kiwiDateChunks[0]}`;
};

export const pushToUrl = (object) => {
  const newQueryKeys = Object.keys(object);
  const newQuery = newQueryKeys.map(key => `${key}=${object[key]}`);

  const oldQuery = Object.keys(Router.query)
    .map(key => (
      !newQueryKeys.includes(key) && `${key}=${Router.query[key]}`
    ))
    // filter falsy values
    .filter(value => value);

  const encodedUri = `/?${encodeURI([...oldQuery, ...newQuery].join('&'))}`;

  Router.push(encodedUri);
};
