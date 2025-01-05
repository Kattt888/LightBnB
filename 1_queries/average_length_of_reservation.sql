SELECT AVG(end_date - start_date) AS average_duration
FROM reservations;

String.prototype.removeVowels = function () {
  return this.split("")
  .filter(char => !"aeiouAEIOU".includes(char))
  .join("");
};