<template lang="html">
  <a-row type="flex" justify="center">
    <a-col id="experiment-container" :span="20">
      <a-row id="before-start">
        <a-divider orientation="left">实验介绍</a-divider>
        <a-col id="introduction" :span="24">
          <p><span class="outstanding">Hi {{user.name}}</span> ，这次实验希望你能通过下方的可视化工具来完成6个数据分析任务，得到给出的问题的正确答案。这当然是建立在你对数据集内容有一定了解的基础上。</p>
          <p>你可以先花5分钟时间，熟悉界面上的操作。当你觉得你准备好了，请点击左下方的<a-tag color="blue">开始实验</a-tag>按钮，开始实验。</p>
          <p>实验开始后将在左下方出现任务内容，填写你认为正确的结论。点击<a-tag color="blue">上一个</a-tag>、<a-tag color="blue">下一个</a-tag>按钮，回看前后任务内容和修改结论。</p>
          <p>当完成最后一个任务，点击<a-tag color="red">提交结论</a-tag>按钮，结束实验。</p>
        </a-col>
      </a-row>
      <a-row type="flex" align="top">
        <a-col :span="5" class="left">
          <a-divider orientation="left" v-if="!statusDisplay.start">任务（{{experiment.index+1}}/{{experiment.tasks.length}}）</a-divider>
          <a-row id="task" class="block" v-if="!statusDisplay.start">
            <p>{{ experiment.tasks[experiment.index].content }}</p>
          </a-row>
          <a-col id="conclusion" class="block" :span="8" v-if="statusDisplay.start">
            <a-button type="primary" size="large" class="start" @click="startExperiment">开始实验</a-button>
          </a-col>
          <a-col id="conclusion" class="block" :span="24" v-if="statusDisplay.conclusion">
            <a-textarea placeholder="结论是……" :rows="3" :disabled="statusDisplay.end"></a-textarea>
            <a-button type="primary" class="last" :disabled="experiment.index == 0" @click="handleTaskChange('last')">上一个</a-button>
            <a-button type="primary" class="next" v-if="experiment.index != experiment.tasks.length-1" @click="handleTaskChange('next')">下一个</a-button>
            <a-button type="danger" class="finish" v-if="experiment.index == experiment.tasks.length-1" @click="endExperiment">提交结论</a-button>
          </a-col>
        </a-col>
        <a-col :span="19" class="right">
          <a-divider orientation="left">操作区</a-divider>
          <a-row type="flex" justify="start" class="block">
              <!-- 类别（主体）与指标 -->
              <a-col :span="8">
                <a-col :span="12">
                  <a-col :span="24" class="op-attr"><span class="required" style="color:#52c41a">主体</span></a-col>
                  <a-select
                    v-model="operation.ops[operation.currentIdx].entity"
                    :defaultValue="entities[0]"
                    style="width: 120px"
                    @change="handleEntityChange"
                  >
                    <a-select-option
                      v-for="entity in entities"
                      :key="entity"
                    >
                      {{entity}}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="12">
                  <a-col :span="24" class="op-attr"><span class="required" style="color:#f5222d">指标</span></a-col>
                  <a-select
                    v-model="operation.ops[operation.currentIdx].value"
                    style="width: 120px"
                  >
                    <a-select-option
                      v-for="value in secondValues"
                      :key="value"
                      @clange="handleEntityChange"
                    >
                      {{value}}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-col>
              <!-- 分组 -->
              <a-col :span="12">
                <a-col :span="24" class="op-attr" style="color: #722ed1"><span>分组</span></a-col>
                <a-select
                  style="width: 430px"
                  placeholder='选择分组'
                  mode="multiple"
                  maxTagPlaceholder="更多…"
                  :maxTagCount="4"
                  :maxTagTextLength="4"
                  allowClear
                  v-model="operation.ops[operation.currentIdx].group"
                >
                  <a-select-opt-group v-for='r in relation'>
                    <span :label="r.entity" slot="label">{{r.entity}}</span>
                    <a-select-option v-for="attr in r.attrs" :value="attr">{{attr}}</a-select-option>
                  </a-select-opt-group>
                </a-select>
              </a-col>
              <!-- 每组 -->
              <a-col :span="4">
                <a-col :span="24" class="op-attr" style="color:#fa8c16"><span>每组</span></a-col>
                <a-select
                  v-model="operation.ops[operation.currentIdx].valueCal"
                  :defaultValue="valueCals[0]"
                  style="width: 120px"
                >
                  <a-select-option v-for="cal in valueCals" :value="cal">{{ cal }}</a-select-option>
                </a-select>
              </a-col>
              <!-- 范围 -->
              <a-col :span="24">
                <a-col :span="24" class="op-attr special">
                  <span>范围：</span>
                  <template v-for="(r,i) in operation.ops[operation.currentIdx].range.chosenAttr">
                    <a-tooltip
                      v-if="summaryRangeDispaly[i].length > 8"
                      :key="summaryRangeDispaly[i]"
                      :title="summaryRangeDispaly[i]"
                    >
                      <a-tag 
                        closable
                        @close="handleCloseRange(summaryRangeDispaly[i])"
                      >
                        {{summaryRangeDispaly[i].slice(0,8)}}…
                      </a-tag>
                    </a-tooltip>
                    <a-tag
                      v-else
                      closable
                      @close="handleCloseRange(summaryRangeDispaly[i])"
                    > {{summaryRangeDispaly[i]}}</a-tag>
                  </template>
                </a-col>
                <a-col :span="24" class="range">
                  <a-row v-for="(key,index) in Object.keys(ranges)">
                    <span>{{key}}：</span>
                    <a-checkable-tag
                      @change="(checked) => handleRangeChange(key, item, checked)"
                      v-for="item in ranges[key]"
                      :checked="operation.ops[operation.currentIdx].range.detail[key].indexOf(item) > -1"
                    >{{item}}</a-checkable-tag>
                  </a-row>
                  </div>
                </a-col>
              </a-col>
            </a-row>
            <a-divider orientation="left">得到的数据</a-divider>
            <a-row id="display" class="block">
              <span class="script" v-if="ifNotOperation">（请选择你感兴趣的对象&指标）</span>
              <span v-else class="script">
                <!-- xx范围 -->
                <span v-if="opRangeDisplay[0] != '所有'">与</span>
                <a-tag v-for="(range,i) in opRangeDisplay">
                  {{ range }}
                </a-tag>
                <span v-if="opRangeDisplay[0] != '所有'">有关的</span>
                <span v-else>的</span>
                <!-- xx对象 -->
                <a-tag color="green">{{ opEntityDisplay }}</a-tag>
                <!-- xx分组 -->
                <span v-if="opGroupDisplay.length != 0">分别在</span>
                <a-tag color="purple" v-if="opGroupDisplay.legnth != 0" v-for="group in opGroupDisplay">{{ group }}</a-tag>
                <span>的</span>
                <!-- xx聚合方式 -->
                <a-tag color="orange">{{ opValueCalDisplay }}</a-tag>
                <!-- xx指标 -->
                <a-tag color="red">{{ opValueDisplay }}</a-tag>
                <span>值</span>
              </span>
            </a-row>
          <a-divider orientation="left">可视化区</a-divider>
          <a-row id="visualization" class="block">
            <a-col :span="24">
              <div id="chart" style="height: 380px; width: 100%;"></div>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      dataset: null,
      status: 'beforeStart', 
      // status: 'processing', 
      experiment: {
        index: 0,
        tasks: [{
          content: '职级是黄金、白银的老师的课堂教学态度值，在哪个年级最高？'
        }, {
          content: 'fsdfsdfsdffffffffffffffffff'
        }]
      },
      relation: [{
        entity: '学生',
        attrs: ['店面', '学生年龄', '年级']
      }, {
        entity: '老师',
        attrs: ['职级', '团队']
      }, {
        entity: '课堂',
        attrs: ['时段']
      }, {
        entity: '时间',
        attrs: ['年', '月', '周', '日']
      }],
      entities: ['老师', '学生', '课堂'],
      values: {
        '老师': ['教学态度', '教学行为', '课堂激励', '行为规范'],
        '学生': ['课堂态度', '课堂行为', '专注程度', '活跃程度'],
        '课堂': ['数量']
      },
      valueCals: ['平均', '总计'],
      ranges: {
        '团队': ['Team-1', 'Team-2', 'Team-3', 'Team-4'],
        '职级': ['钻石', '黄金', '白银'],
        '时段': ['8:00~8:40', '8:40~9:20', '9:20~10:00', '10:00~10:40', '10:40~11:20', '11:20~12:00'],
        '店面': ['广州南沙店', '广州天河店', '深圳南山店', '广州越秀店', '广州海珠店'],
        '学生年龄': ['6岁','7岁','8岁','9岁','10岁','11岁'],
        '年级': ['一', '二', '三', '四', '五', '六']
      },
      operation: {
        currentIdx: 0,
        ops: [{
          entity: '老师',  // 为空时 ‘’
          value: '教学态度',
          valueCal: '平均',
          range: {
            chosenAttr: ['职级'],
            detail: {
              '团队': [],
              '职级': ['黄金', '白银'],
              '时段': [],
              '店面': [],
              '学生年龄': [],
              '年级': []
            }
          },
          group: ['年级']
        }]
      },
      selectedTags: []
    };
  },
  created() {
    this.initUserInfo();
    this.initDataset();
  },
  computed: {
    // 范围 的 已选项展示
    summaryRangeDispaly() {
      let op = this.operation.ops[this.operation.currentIdx];
      let res = [];
      op.range.chosenAttr.forEach(attr => {
        if (op.range.detail[attr].length != 0) {
          let str = `${attr}：`;
          let values = op.range.detail[attr];
          values.forEach(item => {
            str += `${item}、`;
          });
          str = str.slice(0, str.length-1);
          res.push(str);
        }
      })
      return res;
    },
    // 实验状态控制
    statusDisplay() {
      if (this.status == 'beforeStart') {
        return {
          start: true,
          conclusion: false,
          end: false,
          next: false
        };
      } else if (this.status == 'processing') {
        return {
          start: false,
          conclusion: true,
          end: false,
          next: true
        };
      } else {
        return {
          start: false,
          conclusion: true,
          end: true,
          next: false
        }
      }
    },
    opEntityDisplay() {
      let op = this.operation.ops[this.operation.currentIdx];
      return op.entity;
    },
    opValueDisplay() {
      let op = this.operation.ops[this.operation.currentIdx];
      return op.value;
    },
    opValueCalDisplay() {
      let op = this.operation.ops[this.operation.currentIdx];
      return op.valueCal;
    },
    opGroupDisplay() {
      let op = this.operation.ops[this.operation.currentIdx];
      let groups = [];
      op.group.forEach(g => {
        let e = this.findEntityByAttr(g);
        if (e == op.entity || e == '时间') {
          groups.push(`不同${g}`);
        } else {
          groups.push(`不同${e}${g}`);
        }
      });
      return groups;
    }, 
    opRangeDisplay() {
      let ranges = [];
      let op = this.operation.ops[this.operation.currentIdx];
      if (op.range.chosenAttr.length == 0) {
        ranges = ['所有'];
      } else {
        op.range.chosenAttr.forEach(attr => {
          let values = op.range.detail[attr];
          // 分段
          let seg = '';
          values.forEach(item => {
            seg += `${item}、`;
          });
          seg = seg.slice(0, seg.length-1);
          
          if (!this.ifRelated(attr, op.entity)) {
            let e = this.findEntityByAttr(attr);
            seg = `${seg}${attr}的${e}`;
          } else {
            seg = `${seg}${attr}`;
          }
          ranges.push(seg);
        });
      }
      return ranges;
    },
    // script 综合展示
    ifNotOperation() {
      let op = this.operation.ops[this.operation.currentIdx];
      if (!op.entity && !op.value && !op.valueCal && !op.groups[0] && !op.ranges) return true;
      else return false;
    },
    operationDisplay() {
      if (this.operation.ops.length == 0) {
        return '（请选择你感兴趣的对象&指标）'
      }
      let op = this.operation.ops[this.operation.currentIdx];
      // 生成对象描述
      let entity = this.opEntityDisplay;
      // 生成指标描述
      let value = this.opValueDisplay;
      let valueCal = this.opValueCalDisplay;
      // 生成范围描述
      let ranges = this.opRangeDisplay;
      // 生成分组描述
      let groups = this.opGroupDisplay;
      return `${ranges}的${entity}在${groups}的${valueCal}${value}值`;
    },
    // 联动选择器二级选项
    secondValues() {
      return this.values[this.operation.ops[this.operation.currentIdx].entity];
    }
  },
  methods: {
    // echarts demo
    initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('chart'));

      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '老师平均教学态度',
        },
        tooltip: {},
        legend: {
          show: false
        },
        xAxis: {
            data: ["一年级","二年级","三年级","四年级","五年级","六年级"]
        },
        yAxis: {},
        series: [{
            name: '老师平均教学态度',
            type: 'bar',
            data: [56.8, 98.5, 67.8, 86.4, 90.3, 99.2]
        }]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },
    // 检查属性和对象是否有关
    ifRelated(attr, entity) {
      let relation = this.relation.find(r => r.entity == entity);
      let idx = relation.attrs.indexOf(attr);
      return idx == -1 ? false : true;
    },
    findEntityByAttr(attr) {
      let relation = this.relation.find(r => r.attrs.indexOf(attr) != -1);
      if (relation) return relation.entity;
      else return -1;
    },
    // 页面初始化：用户信息随机生成
    initUserInfo() {
      if (this.$route.params && this.$route.params.user) {
        this.user = this.$route.params.user;
      } else {
        this.user = {
          name: this.$faker().name.findName().replace(/\s*/g,""),
          age: Math.floor(Math.random() * 40),
          major: this.$faker().name.jobType()
        }
      }
    },
    // 页面初始化：随机拉数据
    initDataset() {
      if (this.$route.params && this.$route.params.dataset) {
        this.dataset = this.$route.params.dataset;
      } else {
        let i = Math.floor(Math.random() * 5);
        // 拉数据集数据,并赋值this.dataset
      }
    },
    startExperiment() {
      const that = this;
      this.$confirm({
        title: '确认开始实验吗？',
        content: '开始实验后，不可中途停止哦',
        onOk() {
          that.status = 'processing'
        },
        onCancel() {}
      })
    },
    handleTaskChange(mode) {
      if (mode == 'last') {
        this.experiment.index--;
      } else {
        this.experiment.index++;
      }
    },
    endExperiment() {
      const that = this;
      this.$confirm({
        title: '确认提交结论并结束实验吗？',
        content: '实验结束后，将不能再进行操作',
        onOk() {
          that.status = 'finish';
        },
        onCancel() {}
      })
    },
    // 重现操作
    replay(index) {

    },
    // operation的操作函数
    handleEntityChange(value) {
      this.operation.ops[this.operation.currentIdx].value = this.values[value][0];
    },
    handleRangeChange(attr, value, checked) {
      console.log('handleRangeChange: ', attr, value, checked);
      let attrs = this.operation.ops[this.operation.currentIdx].range.chosenAttr;
      let detail = this.operation.ops[this.operation.currentIdx].range.detail;

      let a = attrs.find(item => item == attr);
      if (!a) {
        attrs.push(attr);
        detail[attr].push(value);
      } else {
        if (checked) {
          detail[attr].push(value);
        } else {
          let idx = detail[attr].findIndex(item => item == value);
          detail[attr].splice(idx, 1);
        }
      }
    },
    handleCloseRange(value) {
      console.log('handleCloseRange:',value)
      let attr = value.split('：')[0];
      let range = this.operation.ops[this.operation.currentIdx].range;
      let idx = range.chosenAttr.findIndex(item => item == attr);
      range.chosenAttr.splice(idx, 1);
      range.detail[attr] = [];
    },
  },
  mounted() {
    this.initEcharts();
  }
}
</script>

<style lang="css" scoped>
#experiment-container {
  margin: 10px 0 20px;
}
#before-start {
  margin: 24px 0 16px;
}
#introduction .outstanding {
  font-size: 24px;
  font-weight: 700;
}
.left .block {
  padding: 8px 12px;
}
.right .block {
  padding: 8px 24px;
  border-left: 1px solid #d9d9d9;
}
#task {
  min-height: 70px;
}
#task p {
  margin: 4px 0;
}
#history {
  /* border-top: 1px solid #d9d9d9; */
  /* height: 580px; */
}

#operation {
  /* min-height: 300px; */
}
.script {
  color: grey;
}
.required::before {
    display: inline-block;
    margin-right: 4px;
    content: '*';
    font-family: SimSun;
    line-height: 1;
    font-size: 14px;
    color: #f5222d;
}
#visualization {
  height: 400px;
  border-left: 1px solid #d9d9d9;
  /* border-top: 1px solid #d9d9d9; */

}
.ant-tag {
  margin: 0 2px !important;
}
#conclusion textarea {
  margin-top: 8px;
}
#conclusion button.finish, #conclusion button.next {
  margin: 10px 0px;
  float: right;
}
#conclusion button.last {
  margin: 10px 0px;
  float: left;
}
#conclusion button.start {
  margin: 40px 0;
  /* float: right; */
}
#experiment-container .title {
  display: block;
  line-height: 26px;
  font-size: 16px;
  font-weight: 400;
  /* padding: 4px 8px; */
}
.range span {
  font-size: 12px;
}
.op-attr {
  padding: 4px 0 8px 0;
  font-weight: 600;

}
.special {
  margin-top: 16px;
  line-height: 24px;
}
#display .ant-tag {
  font-weight: 600;
  font-size: 12px;
}
#display span {
  line-height: 22px;
  font-size: 14px;
}
</style>