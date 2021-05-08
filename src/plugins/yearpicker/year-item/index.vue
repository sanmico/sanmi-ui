<template>
    <div :class="itemContainer">
        <div :class="itemContent" @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <span>{{itemData.value}}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'yearItem',
    data() {
        return {
            itemContainer: 'item-container',
            itemContent: 'item-content',
            itemData: {
                value: 0,
                selected: false,
                passed: false
            }
        }
    },
    props: {
        itemValue: Object
    },
    watch: {
        itemValue: function (value) {
            this.itemData = value
            if (this.itemData.passed) {
                this.itemContainer = 'item-passed'
            } else {
                this.itemContainer = 'item-container'
            }
            if (this.itemData.selected) {
                this.itemContent = 'item-selected'
            } else {
                this.itemContent = 'item-content'
            }
        }
    },
    methods: {
        handleClick() {
            this.itemData.selected = !this.itemData.selected
            this.$emit('change', this.itemData)
        },
        handleMouseEnter() {
            this.itemContent = 'item-selected'
        },
        handleMouseLeave() {
            if (!this.itemData.selected) {
                this.itemContent = 'item-content'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .item-container, .item-passed {
        padding: 5px;
        cursor: pointer;
    }
    .item-passed {
        background: #DCDFE6;
    }
    .item-content, .item-selected {
        text-align: center;
        line-height: 35px;
        border-radius: 5px;
        position: relative;
    }
    .item-selected {
        background: #409EFF;
    }
</style>