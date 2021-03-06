// https://www.mikestreety.co.uk/blog/vue-js-using-localstorage-with-the-vuex-store
import {mapGetters} from "vuex";
import endpoints from "@/js/endpoints";

export const state = () => ({
    workspace: 'default',
    workspaces: [],
    fileview: []
});

export const getters = {
    getWorkspace: (state, getters) => {
        return state.workspace;
    },
    getWorkspaces: (state, getters) => {
        return state.workspaces;
    },
    getFileview: (state, getters) => {
        return state.fileview;
    }

    // ...mapGetters(['workspace','workspaces'])
}

export const mutations = {
    setWorkspace(state, workspace) {
        state.workspace = workspace;
    },
    setWorkspaces(state, workspaces) {
        state.workspaces = workspaces;
    },
    setFileview(state, fileview) {
        state.fileview = fileview;
    }
};

export const actions = {
    async setWorkspace(context, val) {
        // console.log("committing setWorkspace:" + JSON.stringify(val));
        context.commit('setWorkspace', val);
    },
    async setWorkspaces(context, val) {
        // console.log("committing setWorkspaces:" + JSON.stringify(val));
        context.commit('setWorkspaces', val);
    },
    async initWorkspaces(context, reason) {
        // console.log("initializing workspaces because '" + reason + "'")
        this.$axios.$get(endpoints.url(document, context, "/services/workspaces/"))
            .then(res => {
                // console.log("axios/vuex workspaces async get:" + JSON.stringify(res));
                // console.log("committing setWorkspaces:" + JSON.stringify(res));
                context.commit('setWorkspaces', res)
            })
            .catch((e) => {
                console.error("axios/nuxt workspaces async error:", e);
            })
    },
    async putFile(context, params) {
        let to_workspace = params.workspace;
        let to_filename = params.filename;
        let to_content = params.content;
        if (!to_workspace || !to_filename || !to_content) {
            throw("Unable to save file to workspace without params having workspace, filename, content");
        }
        const result = await this.$axios.$post(endpoints.url(document, context, "/services/workspaces/" + to_workspace + "/" + to_filename, to_content))
            .then(res => {
                console.log("axios/vuex workspace put:" + JSON.stringify(res));
                return res;
            })
            .catch((e) => {
                console.error("axios/vuex workspace put:", e)
            });
    },
    async activateWorkspace(context, workspace) {
        const fresh_workspace = await this.$axios.$get(endpoints.url(document, context, "/services/workspaces/" + workspace))
            .then(res => {
                // console.log("axios/vuex workspace async get:" + JSON.stringify(res))
                return res;
            })
            .catch((e) => {
                console.error("axios/nuxt getWorkspace async error:", e)
            })
        await context.dispatch('initWorkspaces', "workspace '" + workspace + "' added");
        // await dispatch.initWorkspaces({commit, state, dispatch}, "workspace '" + workspace + "' added")
        // await this.$store.dispatch("workspaces/initWorkspaces", "workspace '" + workspace + "' added")
        // await this.initWorkspaces({commit}, "workspace added");
        context.commit('setWorkspace', fresh_workspace.name)
        return workspace;
    },
    async purgeWorkspace(context, workspace) {
        await this.$axios.$delete(endpoints.url(document, context, "/services/workspaces/" + workspace))
            .then(res => {
                console.log("purged workspace:" + res)
                return res;
            })
            .catch((e) => {
                console.error("axios/nuxt purgeWorkspace error:", e)
            })
        const found = this.state.workspaces.workspaces.find(w => w.name === workspace);
        if (!found) {
            console.log("setting active workspace to 'default' since the previous workspace '" + workspace + "' is not found")
            await context.dispatch('activateWorkspace', "default");
        }
        await context.dispatch('initWorkspaces', "workspace '" + workspace + "' purged");
    }
};
