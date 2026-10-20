/** Path-style heading used by the Specific workbook: "1:43 MATRIX / FERRARI / SERIES 200 / 212". */
export const heading = ({ scale, brand, mark, series, subseries }) =>
  [[scale, brand].filter(Boolean).join(' '), mark, series, subseries].filter(Boolean).join(' / ')
