// parses to YYYY-MM-DD format (e. g. 2018-02-28)
export const parseToKiwiDate = date => (
  `${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}-${(`0${date.getDate()}`).slice(-2)}`
);

// parses from to YYYY-MM-DD format (e. g. 2018-02-28) MM/DD/YYYY format (e. g. 02/28/2018)
export const parseKiwiDateToStandardDate = (kiwiDate) => {
  const kiwiDateChunks = kiwiDate.split('-');

  return `${kiwiDateChunks[1]}/${kiwiDateChunks[2]}/${kiwiDateChunks[0]}`;
};
