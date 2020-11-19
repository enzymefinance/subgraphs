import fs from 'fs';
import handlebars from 'handlebars';
import moment from 'moment';
import path from 'path';

(async () => {
  const initialTimestamp = moment.utc('2020-11-01T00:00:00.000Z').startOf('month').startOf('day');

  const timestamps = Array(50)
    .fill(null)
    .map((_, index) => initialTimestamp.clone().add(index, 'month').startOf('month').startOf('day'));

  const data = {
    months: timestamps.map((timestamp) => ({ start: timestamp.unix() })),
  };

  const templateFile = path.join(__dirname, '../templates/months.ts');
  const outpufile = path.join(__dirname, '../src/months.ts');
  const templateContent = fs.readFileSync(templateFile, 'utf8');

  const compile = handlebars.compile(templateContent);
  const replaced = compile(data);

  fs.writeFileSync(outpufile, replaced);
})();
