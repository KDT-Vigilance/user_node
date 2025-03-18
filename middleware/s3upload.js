export async function aws_s3_upload(req, res, next) {
  
    // AWS 설정
    AWS.config.update({
      accessKeyId: config.aws.access_key,
      secretAccessKey: config.aws.secret_key,
      region: config.aws.bucket_region,
    });
  
    // S3 인스턴스 생성
    const s3 = new AWS.S3();
  
    // 버킷 이름과 S3에서의 파일명 설정
    const bucketName = config.aws.bucket_name;
    const key = config.aws.bucket_directory + '/' + req.body.requestTable + '/' + v4() + '-' + req.filename;
  
    // 파일을 읽고 S3에 업로드
    let fileContent;
    try{
      fileContent = fs.readFileSync(req.filePath);
    }catch(error){
      console.error('웹서버 업로드 파일 리딩중 exception\n\n\n', error);
      return res.json({status:false, error})
    }
  
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ACL: 'public-read'
    };
  
    // s3 업로드 실시
    try{
      const data = await s3.upload(params).promise();
      console.log("Upload Success", data.Location);
      req.awsUploadPath = data.Location;
  
    }catch(error){
      console.log('AWS S3 Bucket upload Exception \n\n\n', error);
    }
  }