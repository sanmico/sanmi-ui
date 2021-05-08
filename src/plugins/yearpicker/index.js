import YearPick from './year-picker'
import YearPanel from './year-panel'
import Popper from '../utils/popper'

const getPanel = function() {
  return YearPanel
}

export default {
  mixins: [YearPick],
  name: 'YearPicker',
  data() {
    return {
      currentPlacement: 'bottom-start'
    }
  },
  created() {
    this.panel = getPanel(this.type)
  },
  methods: {
    createPopper() {
      if (this.$isServer) return;
      this.currentPlacement = this.currentPlacement || this.placement;
      if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
        return;
      }
      document.body.appendChild(this.popperElm);
      this.popperJS = new Popper(this.reference, this.popperElm, {
        placement: this.currentPlacement,
        removeOnDestroy: true
      })
      this.popperJS._popper.style.zIndex = 9999;
    },
    destroyPopper() {
      if (this.popperJS) {
        this.popperJS.destroy();
        this.popperJS = null;
      }
    },
    updatePopper() {
      const popperJS = this.popperJS;
      if (popperJS) {
        popperJS.update();
        if (popperJS._popper) {
          popperJS._popper.style.zIndex = 9999;
        }
      } else {
        this.createPopper();
      }
    },
  }
}