module.exports = () => {
  const config = require('config');
  const proxyOptions = config.PROXY_OPTIONS;

  for( const proxyOption of proxyOptions){

    const {targetPath} = proxyOption;
    
    if ( targetPath || targetPath == '' ){
      proxyOption.options.rewrite = ( path ) => {

        let newResource = path;
        let match = new RegExp( proxyOption.sourcePath).exec( path);
        if ( match ) {
          newResource = path.replace( match[0], targetPath);
        }

        return [proxyOption.options.target, newResource].join('');
      }
    }

    proxyOption.options.events =
      {error : function (err, req, res) {
        console.log('\nError en proxy: ' + err);
      }
    };
  }

  return proxyOptions;
}
