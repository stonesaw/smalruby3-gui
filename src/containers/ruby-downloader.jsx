import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';

class RubyDownloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
    }
    saveRuby () {
        let code = 'require "smalruby3"\n\n';
        const generator = this.props.rubyCodes.generator;
        for(let id in this.props.rubyCodes.rubyCode) {
            const rubyCode = this.props.rubyCodes.rubyCode[id];
            const bodyCode = generator.prefixLines(rubyCode.bodyCode, generator.INDENT);
            code += `${rubyCode.spriteNewCode} do\n${bodyCode}end\n\n`;
        }
        return new Blob([code], {
            type: 'text/x-ruby-script'
        });
    }
    downloadProject () {
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);

        const content = this.saveRuby();
        if (this.props.onSaveFinished) {
            this.props.onSaveFinished();
        }
        // Use special ms version if available to get it working on Edge.
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(content, this.props.projectFilename);
            return;
        }

        const url = window.URL.createObjectURL(content);
        downloadLink.href = url;
        downloadLink.download = this.props.projectFilename;
        downloadLink.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(downloadLink);
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.downloadProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.rb`;
};

RubyDownloader.propTypes = {
    children: PropTypes.func,
    onSaveFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    rubyCodes: PropTypes.shape({
        rubyCode: PropTypes.object
    })
};

const mapStateToProps = state => ({
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
    rubyCodes: state.scratchGui.rubyCodes
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(RubyDownloader);
