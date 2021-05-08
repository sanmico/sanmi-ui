<template>
    <div class="table-container">
        <year-item v-for="(item, index) in this.yearList" :key="index" :item-value="item" style="width: 60px" @change="handleChange" />
    </div>
</template>

<script>
import yearItem from '../year-item'
import {modeList} from '../year-utils'
export default {
    name: 'yearTable',
    data() {
        return {
            results: [],
            yearList: Array.from({
                length: 16
            }, (value, index) => {
                return {
                    value: new Date().getFullYear() + index,
                    selected: false,
                    passed: false
                }
            })
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
        selectMode: function () {
            this.yearList = this.yearList.map((item) => {
                return {
                    value: item.value,
                    selected: false,
                    passed: false
                }
            })
            this.refreshYearList()
        },
        inputValue: function (value) {
            if (!value) return
            var results = value.map((item) => {
                return parseInt(item)
            })
            results.sort((a, b) => {
                return a - b
            })
            switch (modeList.indexOf(this.selectMode)) {
                case 0:
                    if (results.length > 0) {
                        results.length = 1
                    }
                    break
                case 1:
                    if (results.length > 0) {
                        results = [results[0], results[results.length - 1]]
                    }
                    break
            }
            this.results = results.map((item) => {
                return {
                    value: item,
                    selected: true,
                    passed: modeList.indexOf(this.selectMode) === 1
                }
            })
            this.refreshYearList()
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.yearList = this.yearList.map((item) => {
                return {
                    value: item.value + 0,
                    selected: item.selected,
                    passed: item.passed
                }
            })
            this.$emit("changeRange", this.yearList[0].value, this.yearList[this.yearList.length - 1].value)
        })
    },
    methods: {
        changeYearList(next) {
            if (next) {
                this.yearList = this.yearList.map((item) => {
                    return {
                        value: item.value + 16,
                        selected: false,
                        passed: false
                    }
                })
            } else {
                this.yearList = this.yearList.map((item) => {
                    return {
                        value: item.value - 16,
                        selected: false,
                        passed: false
                    }
                })
            }
            this.mergeYearList()
            this.$emit("changeRange", this.yearList[0].value, this.yearList[this.yearList.length - 1].value)
        },
        refreshYearList() {
            this.mergeYearList()
            if (modeList.indexOf(this.selectMode) === 1) {
                if (this.results.length <= 0) return
                this.yearList = this.yearList.map((item) => {
                    if (item.value >= this.results[0].value && item.value <= this.results[this.results.length - 1].value) {
                        var seled = (item.value === this.results[0].value) || (item.value === this.results[this.results.length - 1].value)
                        return {
                            value: item.value,
                            selected: seled,
                            passed: true
                        }
                    }
                    return {
                        value: item.value,
                        selected: false,
                        passed: false
                    }
                })
            }
        },
        mergeYearList() {
            this.yearList = this.yearList.map((item) => {
                var element = this.results.find((record) => {
                    return record.value === item.value
                })
                if (element) {
                    element.passed = modeList.indexOf(this.selectMode) === 1
                    return element
                } else if (modeList.indexOf(this.selectMode) === 1) {
                    var results = this.results.map((item) => {
                        return item
                    })
                    results.sort((a, b) => {
                        return a.value - b.value
                    })
                    if (results.length > 1) {
                        item.passed = (item.value > results[0].value) && (item.value < results[1].value)
                    }
                }
                return item
            })
        },
        handleChange(data) {
            if (data.selected) {
                this.results.push(data)
            } else {
                var item = this.results.find((record) => {
                    return record.value === data.value
                })
                var idx = this.results.indexOf(item)
                if (idx > -1) {
                    this.results.splice(idx, 1);
                }
            }
            this.returnResult(data)
        },
        returnResult(value) {
            switch (modeList.indexOf(this.selectMode)) {
                case 0:
                    if (this.results.length > 0) {
                        this.results.length = 0
                        this.results.push(value)
                        this.yearList = this.yearList.map((item) => {
                            if (item.value === this.results[0].value) {
                                return {
                                    value: item.value,
                                    selected: true,
                                    passed: false
                                }
                            } else {
                                return {
                                    value: item.value,
                                    selected: false,
                                    passed: false
                                }
                            }
                        })
                    }
                    break;
                case 1:
                    if (this.results.length > 1) {
                        this.results.length = 1
                        this.results.push(value)
                        var results = this.results.map((item) => {
                            return item
                        })
                        results.sort((a, b) => {
                            return a.value - b.value
                        })
                        this.yearList = this.yearList.map((item) => {
                            if (item.value >= results[0].value && item.value <= results[1].value) {
                                var seled = (item.value === results[0].value) || (item.value === results[1].value)
                                return {
                                    value: item.value,
                                    selected: seled,
                                    passed: true
                                }
                            }
                            return {
                                value: item.value,
                                selected: false,
                                passed: false
                            }
                        })
                    } else {
                        this.yearList = this.yearList.map((item) => {
                            if (this.results.length > 0 && this.results[0].value === item.value) {
                                return {
                                    value: item.value,
                                    selected: true,
                                    passed: true
                                }
                            }
                            return {
                                value: item.value,
                                selected: false,
                                passed: false
                            }
                        })
                    }
                    this.results = this.results.map((item) => {
                        item.passed = true
                        return item
                    })
                    break;
                case 2:
                    this.yearList = this.yearList.map((item) => {
                        return {
                            value: item.value,
                            selected: item.selected,
                            passed: false
                        }
                    })
                    break;
            }
            this.$emit('selection', this.results)
        },
        clearYearList() {
            this.yearList = this.yearList.map((item) => {
                return {
                    value: item.value,
                    selected: false,
                    passed: false
                }
            })
            this.results.length = 0
            this.$emit('selection', this.results)
        }
    },
    components: {
        yearItem
    }
}
</script>

<style lang="scss" scoped>
    .table-container {
        display: flex;
        flex-flow: row wrap;
    }
</style>