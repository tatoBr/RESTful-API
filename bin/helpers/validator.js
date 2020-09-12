class Validator{

    constructor(){
        //this._model = model;
        this._errors = []
    }

    idFormatIsValid( id )
    {
        let regEx = /^[a-fA-F0-9]{24}$/;

        if( typeof id != 'string' ){
            this._errors.push( 'id não é do tipo string')
            return false;
        }
        
        else if( !regEx.test( id )){
            this._errors.push( 'Formato de id Inválido' )
            return false
        }
        else return true;
        
    }
}



module.exports = Validator;