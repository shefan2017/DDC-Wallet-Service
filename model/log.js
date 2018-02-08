console.log("==============log===")
module.exports={
    name:"logs",
    fields:[
        {
            name:"id",
            type:"String",
            length:"20",
            not_null:true,
            primary_key:true
        },
        {
            name:"code",//交易类型
            type:"String",
            length:64,
            not_null:true,
        },
        {
            name:"LandName",
            type:"String",
            length:"20",
            not_null:true
        },
        {
            name:"amount",//金额
            type:"String",
            length:1,
            not_null:true
        },{
            name:"precesion",//描述
            type:"String",
            length:"4096",
            not_null:true
        },

         {
             name:"timestamp",//时间
             type:"Number",
             not_null:true
         },
        {
            name: 'authorId',//用户
            type: 'String',
            length: 50,
            not_null: true
        },{
            name:"currency",
            type:"String",
            length:10,
            not_null: true
        }

    ]
}