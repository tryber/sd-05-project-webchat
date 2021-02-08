const getCollection = require('./connection');

const getUsers = async () => {
  try {
    const usersOnline = await getCollection('users').then((users) => users.find().toArray());
    // console.log(`model: ${history[0]}`);
    return usersOnline;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const create = async ({ id, nickname }) => {
  try {
    const insertNew = await getCollection('users').then((users) => users.insertOne({ id, nickname }));
    // console.log("insert ok");
    return insertNew;
  } catch (error) {
    console.log('deu ruim inserir msg nova', error.message);
    return error.message;
  }
};

const getById = async (id) => {
  try {
    const getOne = getCollection('users').then((db) => db.findOne(id));
    return getOne;    
  } catch (error) {
    console.log('deu ruim buscar ID', error.message);
    return error.message;
  }
}
// if (!ObjectId.isValid(id)) return null;

const updateUser = async (id, nickname) => {
  try {
    const user = await getCollection('users')
      .then((users) => users.updateOne({ id }, { $set: { nickname } }));
  
    console.log(user);
    return user;
    
  } catch (error) {
    console.log('deu ruim buscar update', error.message);
    return error.message;  }
};

const excludeUser = async (id) => {
  try {
    const excluded = await getCollection('users').then((users) => users.deleteOne({ id }));
    console.log(excluded.result);
    return excluded;
  } catch (error) {
    console.log('deu ruim excluir', error.message);
    return error.message;
  }
};

module.exports = {
  getUsers,
  create,
  getById,
  updateUser,
  excludeUser,
};

 "Usuário 1612814604749", "Usuário 1612814800459", "Usuário 1612814932598"
