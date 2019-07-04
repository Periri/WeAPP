const app = getApp();
Page({
  data: {
    timeSetting: true,
    nightPattern: false
  },

  onLoad: function () {
    var that = this;
    ['timeSetting'].forEach(function (setting) {
      var value = wx.getStorageSync(setting);
      if (typeof value === 'boolean') {
        var config = {};
        config[setting] = value;
        that.setData(config);
      }
    });
  },

  toggleSetting: function (e) {
    var setting = e.currentTarget.dataset.setting;
    var value = e.detail.value;
    wx.setStorageSync(setting, value);
  }
})