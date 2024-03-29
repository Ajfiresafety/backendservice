const express=require('express');
const app=express();
const request=require('request');
const cors=require('cors');
const cheerio=require("cheerio");
var numtotext = require('number-to-words');
const axios = require("axios");
const dbUrl="https://ajfireservice-229a3-default-rtdb.firebaseio.com/";
const header= {'Content-Type': 'application/x-www-form-urlencoded'};
app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/users',function(req,res){
    const userarr=[];
    request({url:dbUrl+"login.json"},(err,response)=>{
        if(!err){
            const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            data.forEach((x, i) => userarr.push(x.username));
            res.json({status:true,data:userarr,message:"User Details fetched Successfully"});
        }else{
            res.json({status:false,data:userarr,message:"Something Went Wrong"});

        }
        
    })
})

app.post('/addproduct',function(req,res){
    const product=req.body
    request.post({url:dbUrl+"allproducts.json",form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(error,httpResponse,body){
        if(!error){
            res.send({status:true,message:"Product Was Added Successfully"});
        }else{
            res.send({status:false,message:"Failed to add product"});
        }
    })
})

app.post('/getproducts',function(req,res){
    request({url:dbUrl+"allproducts.json"},(err,response)=>{
        if(!err){
            var obj=[]
            const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            const keys=[...new Map(Object.entries(JSON.parse(response.body))).keys()];
            for(let i=0;i<data.length;i++){
                obj.push({
                    userid:keys[i],
                    productdesc:data[i].productdesc,
                    productimage:data[i].productimage,
                    productname:data[i].productname,
                    productprice:data[i].productprice
                })
            }
            res.json({status:true,data:obj,message:"Products Fetched Successfully"})
        }else{
            res.json({status:false,message:"Products Fetch Error"})
        }
        
    })
})

app.post('/addstaff',function(req,res){
    request.post({url:dbUrl+"login.json",form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Staff was added successfully !!"});
        }else{
            res.json({status:false,message:"Add Staff is Failed !!"});
        }
    })
})

app.post('/updatestaff',function(req,res){
    const userId=req.body.userid;
    request.put({url:dbUrl+`login/${userId}.json`,form:JSON.stringify(req.body.fnlobj),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Staff details was updated successfully !!"});
        }else{
            res.json({status:false,message:"Staff details updated Failed !!"});
        }
    })
})

app.post('/logindetails',function(req,res){
    const reqdata=req.body.uname;
    request({url:dbUrl+"login.json"},(err,response)=>{
        if(!err){
            var obj=[];
            const keys=[...new Map(Object.entries(JSON.parse(response.body))).keys()];
            const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            for(let i=0;i<data.length;i++){
                obj.push({
                    username:data[i].username,
                    password:data[i].password,
                    role:data[i].role,
                    userid:keys[i]
                })
            }
            var filterdata=obj.filter((el)=>el.username==reqdata);
            res.json({status:true,data:filterdata[0],message:"Login Details Fetched Successfully"})
        }else{
            res.json({status:false,data:filterdata[0],message:"Login Details Fetch Failed"})
        }
        

    })
})

app.post('/loginacc',function(req,res){
    const getreq=req.body;
    var status;
    request({url:dbUrl+'login.json'},(err,response)=>{
        if(!err){
            const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            var status=[];
            var role;
            data.forEach((x, i) =>status.push(x.username==req.body.username && x.password==req.body.password));
            data.forEach((y, i) =>{
                if(y.username==req.body.username && y.password==req.body.password){
                    role=y.role;
                }
            });
            if((status.filter((el)=>el==true)).length>0){
                res.json({status:true,message:"Login Successful",role:role})
            }else{
                res.json({status:false,message:"Please Check Your Password"})
            }
        }else{
            res.json({status:false,message:"Something Went Wrong !"});
        }
        
    })
})

app.post('/attendance',function(req,res){
    var date=new Date();
    var fulldate;
    var time;
    fulldate=`${date.getDate()}-${(date.getMonth())+1}-${date.getFullYear()}`;
    time=`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    var fnlobj;

    if(req.body.attendance=="Absent"){
        fnlobj={
            username:req.body.username,
            attendance:req.body.attendance,
            date:fulldate,
            time:""
        }
    }else{
        fnlobj={
            username:req.body.username,
            attendance:req.body.attendance,
            date:fulldate,
            time:time
        }
    }

    request({url:dbUrl+"attendance.json"},function(err,response){
        if(!err){
        const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        var status=[];
        var fnlres=[];
        data.forEach((x,i)=>status.push(x.date==fulldate && x.username==fnlobj.username))
        fnlres=status.filter((el)=>el==true);
        if(fnlres.length==0){
            request.post({url:dbUrl+'attendance.json',form:JSON.stringify(fnlobj),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
                res.json({status:true,message:"Attendance Added Successfully"});
            })
        }else{
            res.json({status:false,message:"You Have Already Registered Today's Attendance"}); 
        }
    }else{
        res.json({status:false,message:"Failed to Update Attendance"}); 
    }
    })
})

app.post('/getattendance',function(req,res){
    const keyData=req.body.keyword;
    request({url:dbUrl+'attendance.json'},function(err,response){
        const data=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        var fnldata=[];
        fnldata=data.filter((el)=>el.username==keyData);
        if(fnldata.length>0){
            res.json({status:true,data:fnldata,message:"Data Fetched Successfully"});
        }else{
            res.json({status:false,message:"No Data Available"});
        }
    })
})

app.post('/sitesettings',function(req,res){
    const iconData=req.body;
    request.put({url:dbUrl+'sitesettings/-NKOnCf_c31a-cA0b1I5.json',form:JSON.stringify(iconData),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        res.json({status:true,message:"Site icons has been updated"});
    })
})

app.get('/fetchsitesettings',function(req,res){
    request({url:dbUrl+"sitesettings.json"},function(err,response){
        if(!err){
            const fnlData=[...new Map(Object.entries(JSON.parse(response.body))).values()];
             res.json({status:true,data:fnlData[0],message:"Details Fetched Successfully"});
        }else{
            res.json({status:false,message:"Details Failed to Fetch"});
        }
        
    })
})

app.post('/addstategstcode',function(req,res){
    request.post({url:dbUrl+'statecode.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"New State Code was Added Successfully"});
        }else{
            res.json({status:false,message:"New State was failed to Add"});
        }
    })
})

app.get('/getstatecodes',function(req,res){
    request({url:dbUrl+"statecode.json"},function(err,response){
        if(!err){
            const statecodes=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            res.json({status:true,data:statecodes,message:"State Code Details fetched Succesfully !"});
        }else{
            res.json({status:false,message:"State Code Details was failed to fetch !"});
        }
        
    })
})

app.post('/invoicesettings',function(req,res){
    request.put({url:dbUrl+'invoicesettings/-NKgj0sBYISZT-P2B0MM.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Invoice Settings was Updated Successfully"});
        }else{
            res.json({status:false,message:"Invoice Settings was failed Update"});
        }
    })
})

app.get('/getinvoicesettings',function(req,res){
    request({url:dbUrl+'invoicesettings.json'},function(err,response){
        if(!err){
            const settings=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            res.json({status:true,data:settings[0],message:"Invoice Settings fetched Succesfully !"});
        }else{
            res.json({status:false,message:"Invoice Settings was failed to fetch !"});
        }
    })
})

app.post('/savebill',function(req,res){
    request.post({url:dbUrl+'allbills.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Your Invoice Has Been Saved Successfully"});
        }else{
            res.json({status:false,message:"Your Invoice Was Failed to Save"});
        }
    })
})

app.get('/printbill',function(req,res){
    request({url:dbUrl+'allbills.json'},function(err,response){
        const invoicebill=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        var ruppeesinwords=''
        try{
            ruppeesinwords=numtotext.toWords(invoicebill[invoicebill.length-1].billtable.overalltotal);
        }catch(e){ }
        if(!err){
            res.json({status:true,data:invoicebill[invoicebill.length-1],Amountinwords:ruppeesinwords,message:"Bill Fetched Successfully"});
        }else{
            res.json({status:false,message:"Bill was Failed to Fetch"});
        }
    })

})

app.post('/addbiller_name',function(req,res){
    request.post({url:dbUrl+'billersname.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Biller Was Added Successfully"});
        }else{
            res.json({status:false,message:"Biller Was Failed to Add"});
        }
    })
})

app.get('/getbillers_list',function(req,res){
    request({url:dbUrl+'billersname.json'},function(err,response){
        const billerslist=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        if(!err){
            res.json({status:true,data:billerslist,message:"Billers Data was Fetched Successfully"});
        }else{
            res.json({status:false,message:"Biller data Was Failed to Fetch"});
        }
    })
})

app.post('/addnogst_bill',function(req,res){
    request.post({url:dbUrl+'nogstbills.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"No GST Bill was Added Successfully"});
        }else{
            res.json({status:false,message:"No Gst Bill was failed to add"});
        }
    })
})

app.post('/addpurchase_report',function(req,res){
    request.post({url:dbUrl+'purchasereport.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Purchase Report was Added Successfully"});
        }else{
            res.json({status:false,message:"Purchase Report was failed to add"});
        }
    })
})

app.get('/purchasereport_list',function(req,res){
    request({url:dbUrl+'purchasereport.json'},function(err,response){
        const purchasereport=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        if(!err){
            res.json({status:true,data:purchasereport,message:"Purchase Report Fetched Successfully"});
        }else{
            res.json({status:false,message:"Purchase Report was Failed to Fetch"});
        }
    })
})

app.post('/addnogstpurchase_report',function(req,res){
    request.post({url:dbUrl+'nogstpurchasereport.json',form:JSON.stringify(req.body),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Purchase Report was Added Successfully"});
        }else{
            res.json({status:false,message:"Purchase Report was failed to add"});
        }
    })
})

app.get('/nogstpurchase_reportlist',function(req,res){
    request({url:dbUrl+'nogstpurchasereport.json'},function(err,response){
        const nogstpurchasereport=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        if(!err){
            res.json({status:true,data:nogstpurchasereport,message:"Purchase Report Fetched Successfully"});
        }else{
            res.json({status:false,message:"Purchase Report was Failed to Fetch"});
        }
    })
})

app.get('/printnogst_bill',function(req,res){
    request({url:dbUrl+'nogstbills.json'},function(err,response){
        const nogstbill=[...new Map(Object.entries(JSON.parse(response.body))).values()];
        var ruppeesinwords='';
        try{
            ruppeesinwords=numtotext.toWords(nogstbill[nogstbill.length-1].billtable.overalltotal);
        }catch(e){}
        if(!err){
            res.json({status:true,data:nogstbill[nogstbill.length-1],Amountinwords:ruppeesinwords,message:"Bill Fetched Successfully"});
        }else{
            res.json({status:false,message:"Bill was Failed to Fetch"});
        }
    })
})

app.get('/allgstinvoice',function(req,res){
    request({url:dbUrl+'allbills.json'},function(err,response){
        if(!err){
            try{
                const allgstinvoice=[...new Map(Object.entries(JSON.parse(response.body))).values()];
                res.json({status:true,data:allgstinvoice.reverse(),message:"All GST Invoice fetched Successfully !!"});
            }catch(e){
                res.json({status:false,message:"GST Invoice are empty!!"});
            }
        }
    })
})

app.post('/getgstbill',function(req,res){
    request({url:dbUrl+'allbills.json'},function(err,response){
        if(!err){
            const getgstbill=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            const gstbillkeys=[...new Map(Object.entries(JSON.parse(response.body))).keys()];
            
            const invoiceno=req.body.invoice_num;
            var fnlres=[]=getgstbill.filter((el)=>el.invoice_no==invoiceno);
            var ruppeesinwords='';
            try{
                ruppeesinwords=numtotext.toWords(fnlres[0].billtable.overalltotal);
            }catch(e){}
            res.json({status:true,data:fnlres[0],Amountinwords:ruppeesinwords,message:"Bill Fetched Successfully"});
        }

    });

})

app.get('/allnogstinvoice',function(req,res){
    request({url:dbUrl+'nogstbills.json'},function(err,response){
        if(!err){
            try{
                const allgstinvoice=[...new Map(Object.entries(JSON.parse(response.body))).values()];
                res.json({status:true,data:allgstinvoice.reverse(),message:"All No GST Invoice fetched Successfully !!"});
            }catch(e){
                res.json({status:false,message:"No GST Invoice is empty !!"});
            }

        }
    })
})

app.post('/getnogstbill',function(req,res){
    request({url:dbUrl+'nogstbills.json'},function(err,response){
        if(!err){
            const getgstbill=[...new Map(Object.entries(JSON.parse(response.body))).values()];
            const gstbillkeys=[...new Map(Object.entries(JSON.parse(response.body))).keys()];
            
            const invoiceno=req.body.invoice_num;
            var fnlres=[]=getgstbill.filter((el)=>el.invoice_no==invoiceno);
            var ruppeesinwords='';
            try{
                ruppeesinwords=numtotext.toWords(fnlres[0].billtable.overalltotal);
            }catch(e){}
            res.json({status:true,data:fnlres[0],Amountinwords:ruppeesinwords,message:"Bill Fetched Successfully"});
        }

    });

})

app.post('/gststatus',function(req,res){
    const gstno=req.body.gstno;
    const options = {
        method: 'GET',
        url: 'https://gst-return-status.p.rapidapi.com/free/gstin/'+gstno,
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': '5d804c5658mshd863162740ffaccp190893jsn346407affba1',
          'X-RapidAPI-Host': 'gst-return-status.p.rapidapi.com'
        }
      };
      
      axios.request(options).then(function (response) {
          res.send(response.data)
      }).catch(function (error) {
          res.send(error)
      });
})

app.post("/gstdetails",async function(req,res){
    var url="https://irisgst.com/gstin-filing-detail/?gstinno="+req.body.gstno;
    var dataArr=[]
        try{
            const response=await axios.get(url);
            const $=cheerio.load(response.data);
            const gstdetail=$('.form-control');
            gstdetail.each(function(){
                dataArr.push($(this).val())
            })

            var dataObj={
                tradeName:dataArr[0],
                adr:dataArr[6]
            }

            if(dataArr.length>0){
                res.json({status:true,data:dataObj,message:"GST Data Fetched Successfully"});
            }else{
                res.json({status:false,message:"No Data Found !!"});
            }

        }catch(e){
            console.log(e);
        }
})

app.post('/getproduct',function(req,res){
    request({url:dbUrl+`allproducts/${req.body.userid}.json`},function(err,response){
        if(!err){
            const productdata=JSON.parse(response.body);
            res.json({status:true,data:productdata,message:"Product Fetched Successfully !!"});
        }else{
            res.json({status:false,message:"Data was failed to fetch !!"});
        }
    })
})

app.post('/updateproduct',function(req,res){
    request.put({url:dbUrl+`allproducts/${req.body.userid}.json`,form:JSON.stringify(req.body.data),headers:{'Content-Type': 'application/x-www-form-urlencoded'}},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Product Data was updated Successfully !!"});
        }else{
            res.json({status:false,message:"Product Data was failed to update !!"});
        }
    })

})

app.post('/deleteproduct',function(req,res){
    request.delete({url:dbUrl+`allproducts/${req.body.userid}.json`},function(err,response,body){
        if(!err){
            res.json({status:true,message:"Data was Deleted Successfully !"});
        }else{
            res.json({status:false,message:"Failed to delete !"});          
        }
    })
})

app.listen(4000,()=>{
    console.log("Port is Running")
})
