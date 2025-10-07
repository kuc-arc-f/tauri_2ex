
function Compo(props: any) {
console.log(props);
  
  const closeButton = function(){
    const dlg = document.getElementById(props.name);
    if(dlg) {
      //@ts-ignore
      dlg.close();
    }
  }
  
  const okFunc = async function(){
    console.log("#okFunc");
    props.cbFunction();
  }
  
  return (
  <dialog id={props.name} className="dialog rounded-lg">
    <div className="bg-white px-8 pt-3 pb-3 dialog_body_wrap">
      <p className="text-3xl font-bold">{props.message}</p>
      <hr className="my-3" />
      <button onClick={()=>okFunc()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-8 me-2 rounded"
        type="submit" value="OK">Ok</button>
      <button onClick={()=>closeButton()}
        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded"
        type="submit" value="OK">Cancel</button>

    </div>
  </dialog>
  );
}
export default Compo;
