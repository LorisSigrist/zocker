import { zocker } from './dist/index.js';
import { z } from 'zod/v4';

const schema = z.uuidv7();

const zock = zocker(schema);
const data = zock.generateMany(100);
console.log(data);