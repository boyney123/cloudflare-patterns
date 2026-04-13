import { Hono } from 'hono';
import notes from './notes/routes';

export { Notes } from './notes/notes';

const app = new Hono();

app.route('/notes', notes);

export default app;
