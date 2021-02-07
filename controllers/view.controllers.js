module.exports = (app) => async (connection) => {
  const collection = await connection('messages');
  app.get('/', async (_req, res) => {
    const messages = await collection.find().toArray();
    res.render('index', { messages });
  });
};
