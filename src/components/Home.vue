<template lang="html">
<a-row id="container" type="flex" justify="center">
  <a-col :span="20">
    <a-row type="flex" justify="start">
      <a-col>
        <p id="welcome">Welcome！请先提交个人信息，待下方选项激活后，选择你<span style="font-weight: bolder; color: #2794ff">最熟悉</span>
          <a-tooltip :title="description"><a-icon type="question-circle" theme="twoTone" twoToneColor="#2794ff" /></a-tooltip>
          的业务数据集，使用下载功能熟悉数据集内容，熟悉完成后可进入对应实验界面：）
        </p>
      </a-col>
    </a-row>
    <a-row id="form-container">
      <span class="title">（1）填写个人信息：</span>
      <a-col class="form">
        <a-form :form="form" :layout="formLayout" @submit="createUser">
          <a-form-item
            label="姓名"
            :labelCol="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input
              :disabled="formIsDisabled"
              v-decorator="[
                'name',
                { rules: [{ required: true, message: '请输入姓名' }] }
              ]"
            >
            </a-input>
          </a-form-item>
          <a-form-item
            label="年龄"
          >
            <a-input-number
              :disabled="formIsDisabled"
              v-decorator="[
                'age',
                { rules: [{ required: true, message: '请输入年龄哦' }] }
              ]"
              :min="18"
              :max="40"
            >
            </a-input-number>
          </a-form-item>
          <a-form-item
            label="专业"
            :labelCol="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input
              :disabled="formIsDisabled"
              v-decorator="[
                'major',
                { rules: [{ required: true, message: '请输入专业' }] }
              ]">
            </a-input>
          </a-form-item>
          <a-form-item :wrapper-col="buttonLayout.wrapperCol">
            <a-button type="primary" html-type="submit" :disabled="formIsDisabled">提交</a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <a-row id="dataset-container">
      <span class="title">（2）选择数据集：</span>
      <a-radio-group class="datasets" name="datasets" v-model="datasets.chosenIndex">
        <div class="dataset" v-for="(dataset,index) in datasets.meta">
          <a-radio :value="index">{{ dataset.display }}</a-radio>
          <a-button type="link" @click="downloadDataset(dataset.name)">下载</a-button>
          <!-- <a :href="dataset.filepath" :download="dataset.filename"><a-icon type="download"></a-icon></a> -->
        </div>
      </a-radio-group>
      <span class="title">（3）进入实验：</span>
      <a-list class="groups" :grid="listGrid" :dataSource="groups" >
        <a-list-item slot="renderItem" slot-scope="item, index">
          <a-card hoverable @click="readyToBegin(index)">
            <a-row type="flex" justify="center">
              <a-col><span>{{ item.title }}</span></a-col>
            </a-row>
          </a-card>
        </a-list-item>
      </a-list>
      <a-modal v-if="modal.isVisible" :visible="modal.isVisible" :title="modal.title" :closable="false">
        <p>您选择了“{{ datasets.meta[datasets.chosenIndex].display }}”数据集。</p>
        <p>如果已经对数据集中数据属性基本熟悉，那么可以开始了！</p>
        <p>如果还不太熟悉，为了保证实验效果，希望您使用预览或下载功能多熟悉一下数据集内容再开始：）</p>
        <template slot="footer">
          <a-button key="back" @click="waitMoreTime">再熟悉熟悉</a-button>
          <a-button key="submit" type="primary" @click="letsBegin">开始吧</a-button>
        </template>
      </a-modal>
    </a-row>
  </a-col>
</a-row>
</template>

<script>
import API from '../api';
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this)
  },
  data() {
    return {
      user: {
        name: null,
        age: null,
        major: null
      },
      modal: {
        isVisible: false,
        title: '即将开始测试'
      },
      datasets: {
        chosenIndex: 0,
        meta: []
      },
      description: '5个业务数据集中，您本人对业务相对最熟悉的那个',
      formLayout: 'inline',
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 }
      },
      buttonLayout: {
        span: 24,
        offset: 14
      },
      listGrid: {
        gutter: 30,
        column: 5
      },
      groups: [{
        title: '进入对照组'
      }, {
        title: '进入实验组'
      }],
      chosenGroup: 'contrast',
      entryIsDisabled: true,
      formIsDisabled: false
    }  
  },
  computed: {
  },
  methods: {
    readyToBegin(index) {
      if (this.entryIsDisabled) {
        this.$message.error('你还没有填写并提交最重要的个人信息哦：）');
        return;
      }
      this.modal.isVisible = true;
      this.chosenGroup = index == 0 ? 'contrast' : 'experimental';
    },
    letsBegin() {
      this.modal.isVisible = false;
      this.$router.push({
        name: this.chosenGroup,
        params: {
          user: this.user, 
          dataset: this.datasets.meta[this.datasets.chosenIndex]
        }
      })
    },
    waitMoreTime() {
      this.modal.isVisible = false;
    },
    // api function
    createUser(e) {
      e.preventDefault();
       this.form.validateFields((err, values) => {
        if (!err) {
          let url = API.record.create();
          this.$http.post(url, values)
            .then((res,error) => {
              if (error) {
                this.$message.error(`抱歉，出现问题：${error}`);
              } else {
                this.$message.success('提交个人信息成功！');
                this.user = res.data;
                this.formIsDisabled = true;
                this.entryIsDisabled = false;
              }
            })
        }
      });
    },
    initDatasets() {
      let url = API.dataset.retrieve();
      this.$http.get(url)
        .then((res, error) => {
          if (error) {
            this.$mess.error(`抱歉，出现问题：${error}`);
          } else {
            this.datasets.meta = res.data;
          }
        })
    },
    downloadDataset(name) {
      let url = `/api/download/${name}`;
      this.$http.get(url) 
        .then((res, error) => {
          if (error) {
            this.$mess.error(`抱歉，出现问题：${error}`);
          } else {
            window.open(`/api/download/${name}`);
          }
        })
    }
  },
  beforeMount() {
    this.initDatasets();
  }
}
</script>

<style lang="css" scoped>
#container {
  margin-top: 100px;
}

.title {
  display: block;
  font-weight: 600px;
  font-size: 16px;
  margin: 24px 0;
}

#welcome {
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.datasets, .form, .groups {
  margin-left: 40px;
}
.dataset {
  display: block;
  height: 30px;
  line-height: 30px;
}

</style>