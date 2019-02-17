'use strict';
const app = require('../../server/server');

module.exports = function(Category) {
  Category.observe('before delete', function(ctx) {
    return Category.app.models.Product.count({ categoryId: ctx.where.id }).then(res => {
      if (res > 0) {
        return Promise.reject('Error deleting category with products');
      }
    });
  });

  Category.examine = async dtls => {
    const Cat = app.models.Category;

    const [query] = await Cat.find({
      where: { id: dtls },
      fields: ['id'],
      include: {
        relation: 'products',
        scope: {
          fields: ['name', 'id'],
          include: {
            relation: 'properties'
          }
        }
      }
    });
    const results = query.toJSON();
    console.log(results);
    for (let product of results.products) {
      console.log('-', product, typeof product.properties);
    }

    return `Details : ${dtls}`;
  };

  Category.remoteMethod('examine', {
    http: { path: '/examine', verb: 'get', status: 200 },
    accepts: { arg: 'categoryId', type: 'string' },
    returns: { arg: 'dtls', type: 'string' }
  });
};
