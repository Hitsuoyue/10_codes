function generateMatchArr(str){
    const arr = [];
    let tempStr = '';
    for(let item of str){
        // console.log('item', item)
      tempStr += item;
      console.log('tempStr', tempStr)

      let arrPre = [], arrTail=[];
      for(let i = 0; i < tempStr.length; i++){
          let _item = tempStr[i];
        if(i !== 0) {
            arrTail.push(`${tempStr.substring(i)}`)
        }
        if( i !== tempStr.length - 1) {
            arrPre.push(`${tempStr.substring(0, i+1)}`)
        }
      }
      // console.log('tempStr-2', tempStr)
      console.log('arrPre', arrPre)
      console.log('arrTail', arrTail)
    }
}

let a = 'abcdefg';
generateMatchArr(a);
  
//   function match(str) {
//     generateMatchArr(str);
//     let state = fundA;
//     for(let item of str){
//       state = state(item);
//     }
//     return state === end;
//   }
  
//   function fundA(c){
//     return c === 'a' ? fundB : fundA;
//   }
  
//   function fundB(c){
//     return c === 'b' ? fundA2 : fundA(c);
//   }
  
//   function fundA2(c){
//     return c === 'a' ? fundB2 : fundA(c);
//   }
  
//   function fundB2(c){
//     return c === 'b' ? fundA3 : fundA(c);
//   }
  
//   function fundA3(c){
//     return c === 'a' ? fundB3 : fundA(c);
//   }
  
//   function fundB3(c){
//     return c === 'b' ? fundX : fundA(c);
//   }
  
//   function fundX(c){
//     return c === 'x' ? end : fundA3(c);
//   }
  
//   function end() {
//     return end;
//   }
//   console.log(match('abababcabx'))