<template>
    <transition>
        <div class="panel-container" :class="[popperClass]" @click="handlePanelClick" v-show="visible">
            <div class="panel-header">
                <button type="button" style="margin-left: 10px" class="el-picker-panel__icon-btn el-date-picker__prev-btn el-icon-d-arrow-left" @click="changeYearList(0)" />
                <div class="year-range">
                    <span v-text="yearRange.begin" style="margin-right: 10px;"></span> - <span v-text="yearRange.end" style="margin-left: 10px;"></span>
                </div>      
                <button type="button" style="margin-right: 10px" class="el-picker-panel__icon-btn el-date-picker__next-btn el-icon-d-arrow-right" @click="changeYearList(1)" />         
            </div>
            <hr style="height:1px; border:none; border-top:1px solid #E4E7ED;"/>
            <div class="panel-content">
                <year-table ref="yeartable" :select-mode="tableMode" :inputValue="inputValue" @changeRange="changeRange" @selection="handleSelection" />
                <div :class="visibleControl ? 'control-visible' : 'control-hidden'">
                    <button size="mini" icon='el-icon-close' @click="handleCancel" round>取消</button>
                    <button type="primary" icon='el-icon-check' @click="handleConfirm" size="mini" round>确定</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import yearTable from '../year-table'
import { modeList } from '../year-utils'
export default {
    name: 'yearPanel',
    data() {
        return {
            yearRange: {
                begin: '',
                end: ''
            },
            tableMode: 'single',
            visibleControl: false,
            popperClass: '',
            visible: false
        }
    },
    props: {
        selectMode: {
            type: String,
            default: 'single',
            validator: function (value) {
                return modeList.indexOf(value, 0) > -1
            }
        },
        inputValue: {
            type: Array,
            default: function () {
                return []
            }
        }
    },
    watch: {
        selectMode: function (value) {
            this.tableMode = value
            this.visibleControl = false
        }
    },
    components: {
        yearTable
    },
    methods: {
        changeYearList(next) {
            this.$refs.yeartable.changeYearList(next)
        },
        clearYearList() {
            this.$refs.yeartable.clearYearList()
        },
        changeRange(begin, end) {
            this.yearRange.begin = begin
            this.yearRange.end = end
        },
        handleSelection(value) {
            value.sort((a, b) => {
                return a.value - b.value
            })
            let values = value.map((item) => {
                return item.value
            })
            this.$emit('change', values)
        },
        handleCancel() {
            this.$emit('cancel')
        },
        handleConfirm() {
            this.$emit('confirm')
        },
        handlePanelClick(event) {
            this.$emit('click', event)
        }
    }
}
</script>

<style lang="scss" scoped>
.control-visible {
    display: flex;
    justify-content: flex-end;
    margin: 5px;
    border-top: 1px solid #E4E7ED;
    padding-top: 5px;
}

.control-hidden {
    display: none;
}

.panel-container {
    width: 280px;
    border: 1px solid #DCDFE6;
    background-color: #fff;
    border-radius: 5px;
    margin-top: 5px;
}

.panel-header {
    height: 30px;
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
}

.arrow-left, .arrow-right {
    flex: 1;
    line-height: 2;
    background-color: #fff;
    text-align: center;
    cursor: pointer;
}

.year-range {
    line-height: 2;
    flex: 3;
    display: flex;
    justify-content: center;
    margin-top: 5px;
}
</style>