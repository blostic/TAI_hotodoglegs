HOST="http://127.0.0.1:5984"
curl -X PUT $HOST/database
curl -X PUT $HOST/_config/admins/anna -d '"secret"'
curl -X PUT http://anna:secret@127.0.0.1:5984/testdb
curl -H "Content-type: application/json" -d @posts.json -X POST http://anna:secret@127.0.0.1:5984/testdb/_bulk_docs
