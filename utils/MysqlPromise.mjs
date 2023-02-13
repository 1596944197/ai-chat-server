const MysqlQuery = (connection = { query: (sql) => { } }) => {
  return (sql) =>
    new Promise((resolve, reject) => {
      connection.query(sql, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
};

export default MysqlQuery
