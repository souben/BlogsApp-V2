const mongoose = require('mongoose');

//   |'''')   |'''''  |'''\    |  |'''''
//   |....)   |----   |    |   |  |____
//   |    '.  |_____  |___/    |  _____|
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl);

// Unfortanetly Redis doesn't have any support to promises 
// So we will use something gonna help us to make sure that 
// we can use promises instead of callbaks
const util = require('util');
// we're overriding the client.get by primisifying it 
client.hget = util.promisify(client.hget);  // return new that has promisify

mongoose.Query.prototype.cache = function(options = {}){
    this.hKey = options;
    this.bool = true;
    return this;
}

const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function(){ 
    if ( this.bool) {
        const key = JSON.stringify(
            Object.assign({},
                 this.getQuery(),
                { collection: this.mongooseCollection.name }));

        //check in cache
        const value = await client.hget(JSON.stringify(this.hKey), key)
        const document = JSON.parse(value);
        if (document) {
            if (Array.isArray(document)) {
                // we've to make sure that exec return a document mongoose 
                // EX: in our case redis return a JSON ,so in first we've to parse it 
                // after this we've to return a document cause the the query expect that 
                // we will return a document (mongoDB)
                return document.map(doc => new this.model(doc))
            }
            console.log(typeof(document))
            return new this.model(document)
        }
        // console.log(this);
        const result = await exec.apply(this, arguments);
        client.hset(JSON.stringify(this.hKey), key, JSON.stringify(result))
        return result;
    }
    const result = await exec.apply(this, arguments);
    return result;

}
//      // Dow we have any cached data in redis cache 
//     const blogsFromCache = await client.get( req.user.id) ;

//     //if YES
//     if(blogsFromCache){ 
//       console.log('REDIS CACHE');
//       return res.send(JSON.parse(blogsFromCache))
//     }
//     // //if NO
//     const blogs = await Blog.find({ _user: req.user.id });
//     console.log('MONGODB')
//     res.send(blogs);
//     client.set(req.user.id, JSON.stringify(blogs));
//   });