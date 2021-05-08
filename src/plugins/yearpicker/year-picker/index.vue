<template>
    <div class="el-date-editor el-range-editor el-input__inner"
        :class="[pickerSize ? `el-range-editor--${ pickerSize }` : '', pickerDisabled ? 'is-disabled' : '']"
        @click="handleFocus" @mouseenter="handleMouseEnter" @mouseleave="showClose = false"
        v-clickoutside="handleClickoutside" v-if="!ranged" ref="reference">
        <i :class="['el-input__icon', 'el-range__icon', triggerClass]" @click="handleFocus"></i>
        <input class="el-range-input" style="width:100%" :placeholder="placeholder" :disabled="pickerDisabled"
            :readonly="!editable || readonly" :value="displayValue" @change="handleChange" />
        <i @click="handleClickIcon" v-if="haveTrigger" :class="[showClose ? '' + clearIcon : 'hideClearIcon']"
            class="el-input__icon el-range__close-icon">
        </i>
    </div>
    <div class="el-date-editor el-range-editor el-input__inner" :class="[
      pickerSize ? `el-range-editor--${ pickerSize }` : '',
      pickerDisabled ? 'is-disabled' : ''
    ]" @click="handleFocus" @mouseenter="handleMouseEnter" @mouseleave="showClose = false"
        v-clickoutside="handleClickoutside" ref="reference" v-else>
        <i :class="['el-input__icon', 'el-range__icon', triggerClass]"></i>
        <input class="el-range-input" :value="displayValue && displayValue[0]" :placeholder="startPlaceholder"
            @change="handleStartChange">
        <slot name="range-separator">
            <span class="el-range-separator">{{ rangeSeparator }}</span>
        </slot>
        <input class="el-range-input" :value="displayValue && displayValue[1]" :placeholder="endPlaceholder"
            @change="handleEndChange">
        <i @click="handleClickIcon" v-if="haveTrigger" :class="[showClose ? '' + clearIcon : '']"
            class="el-input__icon el-range__close-icon">
        </i>
    </div>
</template>


<script>
import Vue from 'vue'
import { modeList, pickerSizes } from '../year-utils'
import Clickoutside from '../../utils/clickoutside'
export default {
    name: 'yearPicker',
    data() {
        return {
            pickerVisible: false,
            showClose: false,
            userInput: null,
            clickOutside: true
        }
    },
    props: {
        disabled: Boolean,
        readonly: Boolean,
        placeholder: {
            type: String,
            default: '请选择年份'
        },
        startPlaceholder: {
            type: String,
            default: '开始年份'
        },
        endPlaceholder: {
            type: String,
            default: '结束年份'
        },
        rangeSeparator: {
            type: String,
            default: '至'
        },
        value: {},
        size: {
            type: String,
            default: '',
            validator: function (value) {
                return pickerSizes.indexOf(value, 0) > -1
            }
        },
        clearIcon: {
            type: String,
            default: 'el-icon-circle-close'
        },
        clearable: {
            type: Boolean,
            default: true
        },
        editable: {
            type: Boolean,
            default: true
        },
        selectMode: {
            type: String,
            default: 'single',
            validator: function (val) {
                return modeList.indexOf(val, 0) > -1
            }
        }
    },
    destroyed() {
        this.hidePicker()
    },
    watch: {
        pickerVisible(value) {
            if (this.readonly || this.pickerDisabled) return
            if (value) {
                this.showPicker()
            } else {
                this.hidePicker()
            }
        },
        selectMode(value) {
            if (this.picker) {
                this.picker.selectMode = value
            }
        },
        value(value) {
            if (Array.isArray(value)) {
                this.userInput = value
            } else {
                this.userInput = value.split(',')
            }
        },
        userInput() {
            if (this.userInput) {
                this.$emit('change', this.userInput)
            }
        }
    },
    methods: {
        handleChange(event) {
            var value = event.target.value
            this.userInput = value.split(',')
            this.picker.inputValue = this.userInput
        },
        handleStartChange(event) {
            var value = event.target.value
            if (this.userInput) {
                this.userInput = [value, this.userInput[1] || value]
            } else {
                this.userInput = [value, value]
            }
            this.picker.inputValue = this.userInput
        },
        handleEndChange(event) {
            var value = event.target.value
            if (this.userInput) {
                this.userInput = [this.userInput[0] || value, value];
            } else {
                this.userInput = [value, value];
            }
            this.picker.inputValue = this.userInput
        },
        handleFocus() {
            this.pickerVisible = true
        },
        handleClickIcon(event) {
            this.userInput = null
            if (this.picker) {
                this.picker.clearYearList()
            }
            event.stopPropagation()
        },
        handleMouseEnter() {
            if (this.readonly || this.pickerDisabled) return
            if (!this.valueIsEmpty && this.clearable) {
                this.showClose = true
            }
        },
        handleClickoutside() {
            if (this.clickOutside) {
                this.handleClose()
            } else {
                this.clickOutside = true
            }
        },
        handlePickerCancel() {
            this.userInput = null
            if (this.picker) {
                this.picker.clearYearList()
            }
            this.handleClose()
        },
        handlePickerConfirm() {
            this.handleClose()
        },
        handlePickerChange(value) {
            if (Array.isArray(value)) {
                this.userInput = value
                this.$emit('input', value)
            }
            if (this.single) {
                this.handleClose()
            }
        },
        handleClose() {
            this.pickerVisible = false
        },
        hidePicker() {
            if (this.picker) {
                this.pickerVisible = this.picker.visible = false
                this.destroyPopper()
            }
        },
        showPicker() {
            if (this.$isServer) return
            if (!this.picker) {
                this.mountPicker()
            }
            this.pickerVisible = this.picker.visible = true
            this.updatePopper()
        },
        mountPicker() {
            this.picker = new Vue(this.panel).$mount()
            this.picker.selectMode = this.selectMode
            this.popperElm = this.picker.$el
            this.reference = this.$refs.reference
            this.picker.inputValue = this.userInput
            this.picker.$on('change', this.handlePickerChange)
            this.picker.$on('confirm', this.handlePickerConfirm)
            this.picker.$on('cancel', this.handlePickerCancel)
            this.picker.$on('click', () => {
                this.clickOutside = false
            })
        }
    },
    directives: {
        Clickoutside
    },
    computed: {
        ranged() {
            return modeList.indexOf(this.selectMode, 0) === 1
        },
        single() {
            return modeList.indexOf(this.selectMode, 0) === 0
        },
        multiple() {
            return modeList.indexOf(this.selectMode, 0) === 2
        },
        pickerSize() {
            return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
        },
        pickerDisabled() {
            return this.disabled
        },
        valueIsEmpty() {
            const val = this.displayValue
            if (Array.isArray(val)) {
                for (let i = 0, len = val.length; i < len; i++) {
                    if (val[i]) {
                        return false
                    }
                }
            } else {
                if (val) {
                    return false
                }
            }
            return true
        },
        triggerClass() {
            return 'el-icon-date'
        },
        haveTrigger() {
            return true
        },
        displayValue() {
            let value = this.userInput
            if (Array.isArray(value)) {
                if (value.length === 0) return ''
                var years = this.userInput
                switch (modeList.indexOf(this.selectMode, 0)) {
                    case 0:
                        return years[0] + ''
                    case 1:
                        if (years.length === 1) {
                            years.push(years[0])
                        } else {
                            years = [years[0], years[years.length - 1]]
                        }
                        return years
                    case 2:
                        return years.join()
                    default:
                        break
                }
            }
            return value
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../resource/css/index.css';

    .el-input {
        width: 220px;
    }

    .picker-visible {
        display: block;
        position: absolute;
        background-color: #fff;
        z-index: 999;
        box-shadow: darkgrey 3px 3px 10px 3px;
    }

    .picker-hidden {
        display: none;
    }

    .toggle-enter, .toggle-leave-active {
        opacity: 0;
        transform: translateY(-10px);
    }

    .toggle-enter-active, .toggle-leave-active {
        transition: all ease .2s;
    }

    .fade-enter, .fade-leave-active {
        opacity: 0;
        transform: scale3d(0, 0, 0);
    }

    .fade-enter-active, .fade-leave-active {
        transition: all ease .1s;
    }

    .hideClearIcon {
        display: none;
    }
</style>