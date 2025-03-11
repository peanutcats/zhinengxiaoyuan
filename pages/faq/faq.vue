<template>
  <view class="faq-container">
    <view class="header">
      <text class="title">常见问题</text>
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
    </view>
    
    <!-- 分类筛选区域 -->
    <view class="category-filter">
      <scroll-view scroll-x="true" class="category-scroll">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          :class="['category-item', currentCategory === category.id ? 'active' : '']"
          @click="selectCategory(category.id)"
        >
          <text class="category-text">{{ category.name }}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <input 
        class="search-input" 
        v-model="searchText" 
        placeholder="搜索问题..." 
        @input="handleSearch"
      />
      <text class="search-icon">🔍</text>
    </view>
    
    <!-- 问题列表 -->
    <scroll-view scroll-y="true" class="faq-list">
      <view 
        v-for="(item, index) in filteredFaqList" 
        :key="index"
        class="faq-item"
        @click="toggleExpand(index)"
      >
        <view class="question">
          <text class="question-text">{{ item.question }}</text>
          <text class="expand-icon">{{ expandedItems[index] ? '▼' : '▶' }}</text>
        </view>
        <view class="answer" v-if="expandedItems[index]">
          <text class="answer-text">{{ item.answer }}</text>
        </view>
      </view>
      
      <view class="empty-state" v-if="filteredFaqList.length === 0">
        <text class="empty-text">没有找到相关问题</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      expandedItems: {},
      currentCategory: 'all',
      categories: [
        { id: 'all', name: '全部' },
        { id: 'enrollment', name: '入学相关' },
        { id: 'campus', name: '校园生活' },
        { id: 'academic', name: '学术问题' },
        { id: 'dormitory', name: '宿舍相关' },
        { id: 'canteen', name: '食堂相关' },
        { id: 'facility', name: '设施使用' }
      ],
      faqList: [
        {
          question: '新生入学需要准备哪些材料？',
          answer: '新生入学需要准备的材料包括：录取通知书、身份证及复印件、户口本及复印件、一寸免冠照片若干张、学费和住宿费、个人生活用品等。具体要求请参考录取通知书中的指南。',
          category: 'enrollment'
        },
        {
          question: '学校宿舍条件如何？',
          answer: '学校宿舍一般为4-6人间，配备空调、独立卫浴、书桌、衣柜等基本设施。每栋宿舍楼设有公共洗衣房和开水房。不同专业和年级的宿舍条件可能略有差异。',
          category: 'dormitory'
        },
        {
          question: '校园网如何使用？',
          answer: '校园网覆盖全校区，学生可以使用学号和初始密码登录校园网。初次使用需要在信息门户进行实名认证。校园网资费为每月20元，可以在开学时一次性缴纳一学期或一学年的费用。',
          category: 'facility'
        },
        {
          question: '学校食堂有几个？主要提供什么菜系？',
          answer: '学校共有4个食堂，分别是第一食堂（主要提供江苏本地菜）、第二食堂（提供各地特色菜）、第三食堂（西式快餐和小吃）和清真食堂。价格从6元到20元不等，能满足不同学生的需求。',
          category: 'canteen'
        },
        {
          question: '如何申请奖学金？',
          answer: '奖学金分为国家奖学金、国家励志奖学金和校内奖学金。每学年开学后，学校会发布奖学金申请通知，学生需要在规定时间内提交申请材料。评选标准主要包括学习成绩、科研成果、社会工作和综合表现等方面。',
          category: 'academic'
        },
        {
          question: '学校周边有哪些生活设施？',
          answer: '学校周边1公里范围内有大型超市、银行、邮局、医院和商业街。校门口有公交站，可以方便地到达市中心和火车站。学校南门外有小吃街，提供各种美食选择。',
          category: 'campus'
        },
        {
          question: '学校图书馆开放时间是什么时候？',
          answer: '图书馆周一至周日开放，开放时间为：周一至周五8:00-22:00，周六、周日9:00-21:00。寒暑假期间开放时间会有调整，请关注图书馆官方公告。',
          category: 'facility'
        },
        {
          question: '如何办理学生证和校园卡？',
          answer: '新生入学报到时，辅导员会统一发放学生证。校园卡在报到注册后由学院统一办理，一般在入学一周内发放。如有遗失，可以到学生服务中心申请补办。',
          category: 'enrollment'
        },
        {
          question: '学校有哪些社团组织？',
          answer: '学校有超过50个学生社团，涵盖学术科技、文化艺术、体育竞技、社会实践等多个类别。每学期初会举办社团招新活动，学生可以根据自己的兴趣爱好选择加入。',
          category: 'campus'
        },
        {
          question: '选课系统如何使用？',
          answer: '选课通过教务系统进行，一般在每学期开始前两周开放。学生需要使用学号和密码登录，按照培养方案要求选择必修课和选修课。选课分为预选和正选两个阶段，建议提前了解课程信息，合理安排课表。',
          category: 'academic'
        },
        {
          question: '宿舍可以使用哪些电器？',
          answer: '宿舍允许使用的电器包括：台灯、电脑、手机充电器、电风扇等小功率电器。禁止使用电热杯、电热毯、电饭煲、热得快等大功率电器，以及明火电器。违规使用电器可能会被没收并处以罚款。',
          category: 'dormitory'
        },
        {
          question: '学校食堂的营业时间是什么？',
          answer: '各食堂营业时间如下：早餐6:30-9:00，午餐11:00-13:30，晚餐17:00-19:30。第三食堂有夜宵服务，营业时间为20:00-22:30。寒暑假和节假日期间，部分食堂会调整营业时间。',
          category: 'canteen'
        }
      ]
    }
  },
  computed: {
    filteredFaqList() {
      let result = this.faqList;
      
      // 按分类筛选
      if (this.currentCategory !== 'all') {
        result = result.filter(item => item.category === this.currentCategory);
      }
      
      // 按搜索文本筛选
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        result = result.filter(item => 
          item.question.toLowerCase().includes(searchLower) || 
          item.answer.toLowerCase().includes(searchLower)
        );
      }
      
      return result;
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack();
    },
    toggleExpand(index) {
      this.$set(this.expandedItems, index, !this.expandedItems[index]);
    },
    handleSearch() {
      // 搜索逻辑已通过计算属性实现
    },
    selectCategory(categoryId) {
      this.currentCategory = categoryId;
    }
  }
}
</script>

<style>
.faq-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

.header {
  height: 44px;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.back-btn {
  position: absolute;
  left: 15px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: #ffffff;
  font-size: 20px;
}

/* 分类筛选样式 */
.category-filter {
  padding: 10px 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.category-scroll {
  white-space: nowrap;
  padding: 0 10px;
}

.category-item {
  display: inline-block;
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 20px;
  background-color: #f0f0f0;
  transition: all 0.3s ease;
}

.category-item.active {
  background-color: #43a047;
}

.category-text {
  font-size: 14px;
  color: #333333;
}

.category-item.active .category-text {
  color: #ffffff;
}

/* 搜索框样式 */
.search-box {
  padding: 10px 15px;
  background-color: #ffffff;
  position: relative;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 40px 0 15px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
}

.search-icon {
  position: absolute;
  right: 25px;
  top: 18px;
  font-size: 16px;
  color: #999999;
}

/* 问题列表样式 */
.faq-list {
  flex: 1;
  padding: 10px 15px;
  background-color: #ffffff;
}

.faq-item {
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  flex: 1;
}

.expand-icon {
  font-size: 12px;
  color: #666666;
  margin-left: 10px;
}

.answer {
  padding: 15px;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
}

.answer-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
}

.empty-state {
  padding: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-text {
  font-size: 14px;
  color: #999999;
}
</style> 