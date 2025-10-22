
const dbUtil = {
  db: null,
  init: async function() {
    try{
      const sql = await initSqlJs({
          locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`
      });
      const sqldb = new sql.Database();
      sqldb.run(`CREATE TABLE IF NOT EXISTS items (
          id INTEGER,
          name TEXT,
          age INTEGER,
          weight INTEGER
        );`);
      return sqldb;
    }catch(e){
      console.log(e);
      throw new Error("error, init")
    }

  },

  addItem: async function(db: any, values: any[]) {
    try{
      values.forEach((element) => {
        //console.log("id",  element.id);
        //console.log(element.data);
        let sql = `INSERT INTO items (id, name, age ,weight)
         VALUES 
         (
         ${element.id}, 
         '${element.data.name}' , 
         ${element.data.age} ,
         ${element.data.weight}
         );
        `;
        //console.log(sql);
        const res = db.run(sql);
      });
    }catch(e){
      console.log(e);
      throw new Error("error, addItem")
    }

  },

  
  getItems: async function(db: any) {
    try{
      const res = await db.exec("SELECT id, name, age ,weight FROM items;");
      console.log(res);
      if(!res[0]){
        return [];
      }
      const out = [];
      res[0].values.forEach((row) => {
        //console.log(row);
        let target = {
          id: row[0], 
          name: row[1], 
          age: row[2] ,
          weight: row[3]
        }
        out.push(target)
      })

      return out;
    }catch(e){
      console.log(e);
      throw new Error("error, getItems")
    }

  },

  
  sortItem: async function(db: any, colname: string,  order: string) {
    try{
      let order_sql = "ASC";
      if(order !== "asc"){
        order_sql = "DESC"
      }
      const sql = `SELECT id, name, age ,weight FROM items
      ORDER BY ${colname} ${order_sql}
      ;`;
      console.log(sql);

      const res = await db.exec(sql);
      console.log(res);
      if(!res[0]){
        return [];
      }
      const out = [];
      res[0].values.forEach((row) => {
        //console.log(row);
        let target = {
          id: row[0], 
          name: row[1], 
          age: row[2] ,
          weight: row[3]
        }
        out.push(target)
      })

      return out;
    }catch(e){
      console.log(e);
      throw new Error("error, sortItem")
    }

  },

  
  searchItem: async function(db: any, value: string) {
    try{
      const sql = `SELECT id, name, age ,weight FROM items
      WHERE name like '%${value}%'
      ;`;
      console.log(sql);

      const res = await db.exec(sql);
      console.log(res);
      if(!res[0]){
        return [];
      }
      const out = [];
      res[0].values.forEach((row) => {
        //console.log(row);
        let target = {
          id: row[0], 
          name: row[1], 
          age: row[2] ,
          weight: row[3]
        }
        out.push(target)
      })

      return out;
    }catch(e){
      console.log(e);
      throw new Error("error, searchItem")
    }

  },
}
export default dbUtil;
