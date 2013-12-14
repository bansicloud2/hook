/**
 * @class DL.Collection
 * @extends DL.Iterable
 *
 * @param {DL.Client} client
 * @param {String} name
 * @constructor
 */
DL.Collection = function(client, name) {
  this.client = client;

  this.name = name;
  this.wheres = [];
  this.ordering = [];
};

// Inherits from DL.Iterable
DL.Collection.prototype = new DL.Iterable();
DL.Collection.prototype.constructor = DL.Collection;

/**
 * Create a new resource
 * @method create
 * @param {Object} data
 */
DL.Collection.prototype.create = function(data) {
  return this.client.post('collection/' + this.name, { data: data });
};

/**
 * Get collection data, based on `where` params.
 * @method get
 */
DL.Collection.prototype.get = function(options) {
  var params = [],
      query = {};

  // apply wheres
  if (this.wheres.length > 0) {
    query.q = this.wheres;
  }

  // apply ordering
  if (this.ordering.length > 0) {
    query.s = this.ordering;
  }

  // clear wheres/ordering for future calls
  this.reset();

  if (typeof(options)!=="undefined") {
    if (options.paginate) {
      query.p = options.paginate;
    }
  }

  return this.client.get('collection/' + this.name, query);
};

/**
 * Add `where` param
 * @param {Object | String} where params or field name
 * @param {String} operation operation or value
 * @param {String} value value
 */
DL.Collection.prototype.where = function(objects, _operation, _value) {
  var field,
      operation = (typeof(_value)==="undefined") ? '=' : _operation,
      value = (typeof(_value)==="undefined") ? _operation : _value;

  if (typeof(objects)==="object") {
    for (field in objects) {
      if (objects.hasOwnProperty(field)) {
        if (objects[field] instanceof Array) {
          operation = objects[field][0];
          value = objects[field][1];
        } else {
          value = objects[field];
        }
        this.addWhere(field, operation, value);
      }
    }
  } else {
    this.addWhere(objects, operation, value);
  }

  return this;
};

/**
 * alias for get & then
 * @method then
 */
DL.Collection.prototype.then = function() {
  var promise = this.get();
  promise.then.apply(promise, arguments);
  return promise;
};

DL.Collection.prototype.addWhere = function(field, operation, value) {
  this.wheres.push([field, operation, value]);
  return this;
};

/**
 * Clear collection where statements
 * @method reset
 */
DL.Collection.prototype.reset = function() {
  this.wheres = [];
  return this;
};

/**
 * @method orderBy
 * @param {String} field
 * @param {Number|String} direction
 * @return {DL.Collection} this
 */
DL.Collection.prototype.orderBy = function(field, direction) {
  if (!direction) {
    direction = "asc";
  } else if (typeof(direction)==="number") {
    direction = (parseInt(direction, 10) === -1) ? 'desc' : 'asc';
  }
  this.ordering.push([field, direction]);
  return this;
};

/**
 * @method paginate
 * @return {DL.Pagination}
 *
 * @param {Mixed} perpage_or_callback
 * @param {Function} callback
 */
DL.Collection.prototype.paginate = function(perPage, callback) {
  var pagination = new DL.Pagination(this);

  if (!callback) {
    callback = perPage;
    perPage = DL.defaults.perPage;
  }

  this.get({paginate: perPage}).then(function(data) {
    pagination._fetchComplete(data);
    if (callback) { callback(pagination); }
  });

  return pagination;
};

/**
 * Update a single collection entry
 * @param {String} id
 * @param {Object} data
 */
DL.Collection.prototype.update = function(id, data) {
  throw new Exception("Not implemented.");
};

/**
 * Update all collection's data based on `where` params.
 * @param {Object} data
 */
DL.Collection.prototype.updateAll = function(data) {
  throw new Exception("Not implemented.");
};