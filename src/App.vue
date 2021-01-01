<template>
  <div id="app">
    <div class="upload-button-container">
      <el-button type="info" @click="uploadAndInsert">Upload and Insert <i class="el-icon-upload el-icon-right"></i></el-button>
      <el-button type="info" @click="download">Download <i class="el-icon-upload el-icon-right"></i></el-button>
    </div>
    <div class="table-container">
      <el-table
        :data="fileTable"
        @current-change="handleCurrentChange"
        v-loading="loading"
        max-height="350"
        empty-text="No Data"
        stripe
        highlight-current-row
        style="width: 80%">
        <el-table-column
          prop="Name"
          label="Name"
          width="250">
        </el-table-column>
        <el-table-column
          prop="Type"
          label="Type"
          width="250">
        </el-table-column>
        <el-table-column
          prop="Size"
          label="Size">
        </el-table-column>
      </el-table>
    </div>

    <el-upload
      ref="uploads"
      class="upload-container"
      drag
      action="hoge"
      :auto-upload="false"
      :file-list="fileList"
      list-type="picture"
      multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    </el-upload>

  </div>
</template>

<script>
import AWS from 'aws-sdk';

export default {
  name: 'App',
  data: function() {
    return {
      s3: null,
      dynamodb: null,
      BUCKET_NAME: 'testbucket',
      TABLE_NAME: 'Image',
      fileList: [],
      fileTable: [],
      selectedTableItem: null,
      loading: true
    }
  },
  methods: {
    s3init() {
      this.s3 = new AWS.S3({
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        endpoint: 'http://127.0.0.1:9000',
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
      });
    },
    dynamodbInit() {
      this.dynamodb = new AWS.DynamoDB({
        endpoint: 'http://127.0.0.1:8000', 
        region: 'ap-northeast-1',
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey'
      });
    },
    async uploadAndInsert() {
      const files = this.$refs.uploads.uploadFiles;
      if (files === null || files.length === 0) return;

      await this.upload(files);
      await this.insert(files);
    },
    async upload(files) {
      const putPromises = [];
      files.forEach(file => putPromises.push(this.s3.putObject({Bucket: this.BUCKET_NAME, Key: file.name, Body: file.raw}).promise()));
      await Promise.all(putPromises).catch(e => {
        this.$message.error('upload error.');
        throw new Error(e);
      });

      this.$message({message: 'upload success.', type: 'success'});
    },
    async insert(files) {
      const putPromises = [];
      files.forEach(file => {
        let item = {Name: {S: file.name}, Type: {S: file.raw.type}, Size: {S: file.size.toLocaleString()}};
        putPromises.push(this.dynamodb.putItem({Item: item, TableName: this.TABLE_NAME}).promise());
      });
      await Promise.all(putPromises).catch(e => {
        this.$message.error('upload error.');
        throw new Error(e);
      });
      this.scanAndSetFileTable();
    },
    async scanAndSetFileTable() {
      this.loading = true;
      this.fileTable = [];
      const tableScanResult = await this.dynamodb.scan({TableName: this.TABLE_NAME, Limit: 30}).promise();
      tableScanResult.Items.forEach(item => this.fileTable.push({Name: item.Name.S, Type: item.Type.S, Size: item.Size.S + ' Byte'}));
      this.loading = false;
    },
    async download() {
      if (!this.selectedTableItem) {
        this.$message.error('not exist selected item.');
        return;
      }

      const downloadObj =  await this.s3.getObject({Bucket: this.BUCKET_NAME, Key: this.selectedTableItem.Name}).promise();
      const downLoadLink = document.createElement("a");
      downLoadLink.download = this.selectedTableItem.Name;
      downLoadLink.href = URL.createObjectURL(new Blob([downloadObj.Body], {type: this.selectedTableItem.Type}));
      downLoadLink.click();
    },
    handleCurrentChange(val) {
      this.selectedTableItem = val;
    }
  },
  created: function() {
    this.s3init();
    this.dynamodbInit();
    this.scanAndSetFileTable();
  }
}
</script>

<style>
body {
  background: #f6f6f4;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 10px 20px;
}

.upload-button-container {
  text-align: right;
  margin: 10px;
}

.table-container {
  display: flex;
  justify-content: center;
  margin: 0 10%;
  height: 350px;
}

.el-upload-list {
  display: flex;
}

.el-upload-list--picture .el-upload-list__item {
  width: 360px !important;
  height: 90px !important;
}

.upload-container {
  margin: 10px 0;
  overflow-y: auto;
}

</style>
