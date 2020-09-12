/**
 * Class representing a Response
 */
class Response{
    /**
     * Response Contructor
     * @param { Number } status_code an http response status code 
     * @param { String } message a message related to this response
     * @param { any } content any type of content you'd like to pass in this response
     * @param { Error } error any error you'd like to pass in this response
     */
    constructor( status_code, message, content, error = null ){           
        /** HTTP response status code */
        this._stcd = status_code; 
        /** Message response */
        this._msg = message;
        /**Content of the response */
        this._cnt = content
        /** Response error*/
        this._err = error;
    }

    /**
     * Get the http response status code
     * @returns { Number } The status code number
     */
    getStatusCode(){
        return this._stcd
    }

    /**
     * Get an object with a message and a content
     * @return { Object } A server response
     */
    getResponse(){
        if( this._err !== null ){
            return {                
                message: this._err.message,
                content: this._error
            }
        }
        else if( this._cnt !== null ){
            return {
                message: this._msg,
                content: this._cnt,
            }
        }
        else{
            return {
                message: "no content",
                content: null
            }
        }
    }   
}

module.exports = Response;