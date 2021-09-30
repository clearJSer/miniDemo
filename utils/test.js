let a = 1;
console.log(2222)
const timer = setInterval(()=>{
  if(a>10){
    clearInterval(timer)
  }else{
    a++;
    console.log(a)
  }
}, 500)