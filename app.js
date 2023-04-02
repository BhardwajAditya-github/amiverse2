//--- NPM INSTALLED MODUELS ---//

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
// const mongoose = require('mongoose');
const upload = require("express-fileupload");
const fs = require("fs");
const axios = require('axios')
const { BlobServiceClient, ContainerClient } = require("@azure/storage-blob");
const { count } = require('console');


const storageAccountKey = process.env.AZURE_STORAGE_ACCESS_KEY || "AEjRqvQ81owzgZbisVPBvYrI1rZfuhby3n4PH+3GAeTs57MTe2uZZzb196rknL6giHYXwa3qvULM+AStKUOchw=="

//--- SETTING UP ENVIRONMENT ---//

const app = express();
var pdfArray = [];
async function main() {
    const account = "amiversestorage";
    const accountKey = storageAccountKey;
    const endpoint = `https://${account}.blob.core.windows.net`;

    // Create a BlobServiceClient
    const blobServiceClient = new BlobServiceClient(`${endpoint}?${accountKey}`);

    // Get a reference to the container
    const containerClient = blobServiceClient.getContainerClient("amiverse0storage0container");

    // List all of the blobs in the container
    for await (const blob of containerClient.listBlobsFlat()) {
        const blobName = blob.name;
        const blobURL = `https://${account}.blob.core.windows.net/amiverse0storage0container/${blobName}`;
        var pdfData = {
            pdfName: blobName,
            url: blobURL,
            date: "Uploaded on " + blob.properties.createdOn.getDate() + "-" + blob.properties.createdOn.getMonth() + "-" + blob.properties.createdOn.getFullYear()
        }
        pdfArray.push(pdfData);
    }
}

function customSearch(searchArray, pdfArray) {
    let ans = [];
    for (let i = 0; i < pdfArray.length; i++) {
        for (let j = 0; j < searchArray.length; j++) {
            if (pdfArray[i].pdfName.toLowerCase().indexOf(searchArray[j]) != -1) {
                ans.push(pdfArray[i]);
                break;
            }
        }
    }
    return ans;
}
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use("/route", express.static("public"));
app.use(upload());

app.get("/", function (request, response) {
    main()
    response.render("home", { paperArray: pdfArray, count: 5, sr3Array: pdfArray });
    pdfArray = [];
})
app.get("/chat", function (request, response) {
    response.render("recentUpload", { paperArray: [], count: 0, message: "Coming Soon :)" });
})
app.get("/studymaterial", (request, response) => {
    main().catch(err => {
        console.error("An error occurred:", err);
    });
    response.render("notes", { paperArray: pdfArray })
    pdfArray = [];
});

//--- MONGOOSE MODEL  ---//

// mongoose.connect('mongodb+srv://AdityaBhardwaj:-mCD!-2C8ura-iT@cluster0.7i2dkeq.mongodb.net/papersDB');
//     const fileSchema = new mongoose.Schema({
//         date: Number,
//         f_date: String,
//         title: String,
//         year: Number,
//         examCode: String,
//         fName: String
//     });
//     fileSchema.index({'$**': 'text'});
//     const Paper = new mongoose.model("paperFile",fileSchema);
const date = new Date();

// --- DATABASE HANDLING ---//

app.post("/", function (req, res) {
    const title = req.files.uploaded_file.name.substring(0, req.files.uploaded_file.name.lastIndexOf('.')).toLowerCase();
    // const year = req.body.year;
    // const examCode = req.body.examCode;
    const uploaded_file = req.files.uploaded_file;
    // let month = date.getMonth() - (-1);
    // const f_date = date.getDate()+","+month+","+date.getFullYear();
    const fName = uploaded_file.name.substring(0, uploaded_file.name.lastIndexOf('.')) + "_" + Date.now() + uploaded_file.name.substring(uploaded_file.name.lastIndexOf('.'));
    uploaded_file.mv('public/uploads/' + fName, function (err) {
        if (err)
            console.log(err);
    });
    const blobServiceClient = BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=amiversestorage;AccountKey=AEjRqvQ81owzgZbisVPBvYrI1rZfuhby3n4PH+3GAeTs57MTe2uZZzb196rknL6giHYXwa3qvULM+AStKUOchw==;EndpointSuffix=core.windows.net");
    const containerClient = blobServiceClient.getContainerClient("amiverse0storage0container");
    const blobClient = containerClient.getBlockBlobClient(title);

    blobClient.uploadFile("public/uploads/Technical tasks for testRigor_1676670627834.pdf");


    // const paper = new Paper({
    //     date: Date.now(),
    //     f_date: f_date,
    //     title:title,
    //     year:year,
    //     examCode:examCode,
    //     fName: fName
    // });

    // paper.save();

    res.redirect("/");
});


var collegeYear = "";
var programName = "";
var examCode = "";


app.get("/year", function (request, response) {

    main().catch(err => {
        console.error("An error occurred:", err);
    });
    // Paper.find({examCode:examCode},function(err,docs){
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //     if(docs.length == 0){
    //         response.render("year",{paperArray:[],sr3Array:pdfArray,count:docs.length});pdfArray = [];}
    //     else{
    //         response.render("year",{paperArray:docs,sr3Array:pdfArray,count:docs.length});pdfArray = [];}
    //     }
    // })

    collegeYear = "";
    programName = "";
    examCode = "";

})

app.post("/year", function (request, response) {
    collegeYear = request.body.collegeYear;
    programName = request.body.programName;
    examCode = request.body.examCode.toUpperCase();
    response.redirect("/year");
})
var userSearch = "";
app.post("/search", function (request, response) {
    userSearch = request.body.searchText.toLowerCase();
    response.redirect("/search");
})


// /////////////////

app.get("/search", function (request, response) {
    if (userSearch === "") {
        response.render("recentUpload", { paperArray: [], count: 0, message: "NO MATCH FOUND !" });
    }
    else {
        main();
        let tempArray = userSearch.split(" ");
        let rArray = customSearch(tempArray, pdfArray);
        response.render("recentUpload", { paperArray: rArray, count: rArray.length, message: "NO MATCH FOUND !" });
        userSearch = "";

        pdfArray = [];
    }
})
app.get("/comingSoon", function (request, response) {
    response.render("recentUpload", { paperArray: [], count: 0, message: "Coming Soon :)" });
})
// app.get("/recent",function(request,response){
//     // response.render("recentUpload");
//     Paper.find({}).sort({date:-1}).exec(function(err,foundItems){
//         if(err)
//             console.log(err)
//         else{
//             if(foundItems.length === 0)
//                 response.render("recentUpload",{paperArray:[],count:0});
//             else{
//                 response.render("recentUpload",{paperArray:foundItems,count:foundItems.length});
//             }
//         }
//     });
// })
app.get("/contribute", function (request, response) {
    response.render("contribute");
})
app.get("/about", function (request, response) {
    response.render("about");
})
app.get("/fbl", function (request, response) {
    response.render("semester", { subjects: ["French", "German", "Spanish", "Sanskrit", "Japanese"], cName: "FBL", sem: "" });
})
app.get("/bca", function (request, response) {
    response.render("semester", { subjects: ["Computer Applications", "Principles of Operating Systems", "Cloud Security", "Internet of things", "Animation and Gaming", "Python Programming"] });
})
app.get("/ai", function (request, response) {
    response.render("semester", { subjects: ["Basic electrical engineering", "Engineering Chemistry", "Applied Mathematics", "DBMS", "Artificial Intelligence", "Multi Agent Systems"] });
})
app.get("/:paperName", function (request, response) {

    var searchDB = request.params.paperName.toLowerCase();

    if (searchDB === "cse") {
        response.render("course", { courseName: "Computer Science Engineering", cName: "cse" });
    }
    else {
        // console.log(searchDB);
        let searchYEAR;
        Paper.find({ title: searchDB }, function (err, docs) {
            if (err)
                console.log(err);
            else {
                searchYEAR = docs[0];
                if (typeof (searchYEAR) === "undefined") { }
                else {
                    response.render("question-paper", { date: docs[0].f_date, year: docs[0].year, title: docs[0].title, examCode: docs[0].examCode });
                }
            }

        })
    }
})

app.post("/study/:subject", function (request, response) {
    var subName = request.params.subject.toLowerCase().replace("-", " ");
    if (subName === "") {
        response.render("recentUpload", { paperArray: [], count: 0, message: "NO MATCH FOUND !" });
    }
    else {
        main();
        let tempArray = subName.split(" ");
        let rArray = customSearch(tempArray, pdfArray);
        response.render("subject", { subName: subName, paperArray: rArray, videoData: [] });
        userSearch = "";

        pdfArray = [];
    }
})

app.get("/:courseName/:semester", function (request, response) {
    response.cookie({ sameSite: "none", secure: true })
    var courseName = request.params.courseName;
    var semester = request.params.semester;
    switch (semester) {
        case "sem1":
            response.render("semester", { subjects: ["engineering mechanics", "introdunction to computers and programming in c", "workshop practices", "applied mathematics", "engineering physics"], cName: courseName, sem: semester });
            break;
        case "sem2":
            response.render("semester", { subjects: ["basic electrical engineering", "engineering graphics lab", "applied mathematics 2", "engineering chemistry", "technical communication 2"], cName: courseName, sem: semester });
            break;
        case "sem3":
            response.render("semester", { subjects: ["term paper", "basic electronics engineering", "material science", "object oriented programming using cpp", "data structures using c", "digital electronics and computer organization", "applied mathematics 3"], cName: courseName, sem: semester });
            break;
        case "sem4":
            response.render("semester", { subjects: ["self reliance and socialization", "basic simulation lab", "discrete mathematical structures", "java programming", "operating system", "theory of computation", "applied mathematics 4"], cName: courseName, sem: semester });
            break;
        case "sem5":
            response.render("semester", { subjects: ["in house practical training", "mooc", "aptitude and reasoning ability", "analysis and design of algorithms", "database management systems", "exploring the networks", "cognitive skills leadership and decision making"], cName: courseName, sem: semester });
            break;
        case "sem6":
            response.render("semester", { subjects: ["compiler construction", "software engineering", "artificial intelligence"], cName: courseName, sem: semester });
            break;
        case "sem7":
            response.render("semester", { subjects: ["mooc", "minor project", "aspects of indian history for engineers", "law for engineers", "sociology for engineers"], cName: courseName, sem: semester });
            break;
        case "sem8":
            response.render("semester", { subjects: ["major project", "computational data analytics"], cName: courseName, sem: semester });
            break;
        default:
            break;
    }
})

app.post("/notes", function (request, response) {
    var dfname = request.body.dfname.replace("_", " ");
    //access token =  sl.BYI23VN4i5liASMqoTxORPpGb_rZF3gskuravB31-_KJmKLsYW8OqIls4vyHKiaKCoALlHMd0W3qY2Gfxy1t09PuAawoRnh0BPcMBCaR-VfUKy_8GXSDe_C1xpYsOoVaOLhZgRA
    // app key = umbm12x2ifd2v7f
})

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started at port 3000");
})
