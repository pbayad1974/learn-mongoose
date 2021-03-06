Mongo DB is the database
Mongoose is framework to connect & interact with the database

# Setting up Mongoose

    npm i mongoose

    const mongoose = require("mongoose");
    // database hosted at mongodb://localhost/databaseName
    // 1st function runs when connected, 2nd runs when error
    mongoose.connect("mongodb://localhost/testdb",() => {console.log("connected");},
    (e) => console.error(e));

    // Mongoose queues commands so no need to pass those functions

# General

    Schema defines structure of your data. user schema has name, email, etc
    Model is the schema in form you can use (collection)
    Query you make to your Mongodb database & some Mongo DB easy queries
    Middleware

# Schema

    Key value pair where value is the data type
    Example:
        const mongoose = require('mongoose')

        const userSchema = new mongoose.Schema({
            name: String,
            age: Number
        })

        // "User" is the collection name that's created
        module.exports = mongoose.model("User", userSchema)

    // Import this model in script.js or main file
    const User = require "./User"

    // You can use regular Mongo DB functions like find on User.

## Creating document using schema & adding / saving it to DB

        // To create a new document (user here)
        const user = new User({name: 'latesh', age: 20})
        user.save()

        // Another way to create user inside async function ( no need to save)
        const user = await User.create({name: 'latesh', age: 20})

        // Async function so can use .then for user.save().then; Needed to save it to the db
        // Or create async await function & call it
            run()
            async function run() {
                try {
                    const user = new User({name: 'latesh', age: 20})
                    await user.save()
                    console.log(user)
                } catch(e) {
                    console.log(e.message)
                    // e.error.varName will give you indept info about it; e.error.age
                }
            }

        // To change the user's name
        user.name = 'punit'; then do await user.save()

        If multiple entries, can refer using index
        user[0].name = 'abc'
        await user[0].save()

## Schema data Types

        // In value of key value pair in schema (these are type: inside schema validation)
        String, Number, Date

        // If want to reference another's ID like bestFriend in case of user
        mongoose.SchemaTypes.ObjectID

        // Array normal or Array of String eg
        hobbies: []
        hobbies: [String]

        // Nested object
        address: {
            street: String,
            city: String
        }

        // Can directly define schema or use from stored variable for complex schema
        // In same user file; Eg
        const addressSchema = mongoose.Schema({street: String, city: String})

        // Can use this in address's nested object like BUT it'll also has _id property
        address: addressSchema

## Schema validation

        Only validates for CREATING & SAVING an instance NOT for updating or replacing
        Always do findById or any find then call .save() so validation is there; can save in variable as well
        User.findById('aslkjda').save()

        // Validation types
        type (String, Number, etc), required (bool true/false), lowercase (bool), uppercase (bool),
        default (arrow function, or default value for that type),
        immutable (bool) (can't change this then. eg: created date)
        min, max (for Number type)
        minLength, maxLength (for String characters)
        Custom validation
        validate: {
            validator: value => value % 2 === 0, // checks if value is even
            message: props => `${props.value} is not an even number` // if validation failed
        }

        const userSchema = new mongoose.Schema({
            name: String
            email: {
                type: String,
                required: true,
                lowercase: true // will automatically make the value lowercase
                uppercase: false
            }
            createdAt: {
                type: Date,
                default: () => new Date.now()
                // If it was directly called, it'd be static but we need new date everytime an instance is created
                immutable: true
            }
            age: {
                validate: {
                    validator: value => value % 2 === 0,
                    message: props => `${props.value} is not an even number`
                }
            }
        })

# Query (Some MongoDB and some other easier ones)

    Exactly same as Mongo DB commands (Make sure to await otherwise it'll skip the lookup)
    But some extra easy queries are there too

## Mongo DB like queries eg

        const user = await User.findById('kjlaksdf')
        console.log(user)

        User.find({name: 'punit'})
        User.exists({name: 'punit'}) // returns boolean

        User.deleteOne({name: 'punit'}) // doesn't need variable to be returnsed
        User.deleteMany({name: 'punit'})

    DON'T use update or replace as it'll not use validation
    Only creating and saving does it
    So store findBy method in a variable and do .save() on the variable with await

## Mongoose queries

        const user = await User.where("name").equals("Kyle")

        // queries can be:
        gt, gte, lt, lte, equals
        .limit(2) // (limits to 2 entries)
        where("key").validationName("value")
        select('age') // only displays the age & id

        // checking multiple AND conditions, just chain
        // get user where name is kyle, age is greater than 20, less than 40
        const user = await User.where("name").equals("Kyle").where("age").gt(20).lt(40)

## Adding references in schema & populate it Eg: best friend's data using ID autopopulate

        // In the schema template, add ref: modelName
        // find the user/s, set the id, use .populate('fieldName') to populate it

        // Model name is what you define in module.exports of that schema
        // This will search the ID in User model ( collection on documents) when populating

        bestFriend: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        }

        const user = await User.where('age').equals('20')
        user[0].bestFriend = '321837912391723'
        await user[0].save()

        In the query use .populate("bestFriend")
        const user = await User.where('age').equals('20').populate("bestFriend")
        // It'll add the whole user object of that ID in the object which has the bestFriend property & matches the query

# Schema Methods (functions) / Virtuals

    You CANNOT use arrow functions in mongoose

## Add methods to schema (userSchema in User.js) individual instances

        Use "this" keyword to reference the actual individual instance

        userSchema.methods.sayHi() = function() {
            console.log(`Hi. my name is ${this.name}`)
        }

        Now you can run user.sayHi() on any user

    // Rather than addinng methods to individual instances like sayHi()
    // If you want to add method on the model itself (collection)
    // So you can make methods similar to User.find() but it takes name, etc

## Method on model rather than instance (statics kw is imp to add it to model)

        userSchema.statics.findByName = function(name) {
            return this.find({name: new RegExp(name, 'i')})
        }

        // Here new RegExp tells to do case insensitive matching of name passed & i means case insensitive
        // Using this method in main script.js
        User.findByName('punit') // will return all the documents with name as punit

## Query method on model (useful for sorting, arranging, etc)

        userSchema.query.byName = function(name) {
            return this.where({name: new RegExp(name, 'i')})
        }

        Query CANNOT be called directly to model but chained to a method on the model
        This can be a sortby query to make it useful

        const user = await User.byName('punit') // will NOT work
        const user = await User.find().byName('punit') // will WORK

## Virtual (not on database but only accessible in code)

        // Virtual is NOT a property on the schema itself but based on other properties
        // Has .get & .set
        userSchema.virtual('namedEmail').get(function() {
            return `${this.name} <${this.email}>`
        })

        console.log(user.namedEmail)
        // Similar to appSheet virtual column which is only used for some calculation or storing usable data

# Middleware (useful)

    Save, validate, remove , update(less used) middleware

    // pre means it'll happen before the function is executed
    // post means it'll happen after called

    // When running the .save(), before saving, change the "updatedAt" date in the instance
        // next() means execute the next thing
        userSchema.pre("save", function (next) {
            this.updatedAt = Date.now()
            next()
        })

        // If you don't want to save, then in .pre function, instead of next(), throw error
        throw new Error("Fail Save")

    // After saving, run the sayHi function
        // doc is the document that has been saved, so no "this" keyword as save is on an instance
        userSchema.post("save", function (doc,next) {
            doc.sayHi(),
            next()
        })

    // userSchema.pre("save", function (next) {} will run before .save()
    userSchema.pre("validate") //run before validating
    userSchema.pre("remove") // run before removing
