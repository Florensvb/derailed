module.exports = bookshelf.Model.extend({
    tableName: 'tickets',
    hasTimestamps: true,
    hidden: [
        'created_at',
        'updated_at',
    ],
    train: function() {
        return this.belongsTo(require('./train.model'));
    }
});