const url = {
  record: {
    create: function() {
      return `/api/record`;
    },
    update: function(userId) {
      if (!userId) console.error('更新实验数据需要UserID！');
      return `/api/record/${userId}`
    }
  },
  experiment: {
    update: function(userId) {
      if (!userId) console.error('更新实验数据需要UserID！');
      return `/api/experiment/${userId}`
    }
  },
  dataset: {
    retrieve: function(topic) {
      let substr = topic ? `/${topic}` : ``;
      return `/api/dataset${substr}`;
    }
  },
  task: {
    retrieve: function(topic) {
      let substr = topic ? `/${topic}` : ``;
      return `/api/task${substr}`;
    }
    
  }
}

export default url;