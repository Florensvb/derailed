<template>
  <v-container>
    <v-layout
      text-xs-center
      wrap
    >
      <v-flex xs12>
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        ></v-img>
      </v-flex>

      <v-flex xs12>
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to <strong>DErAileD</strong>
        </h1>
      </v-flex>

      <v-flex xs12>
        <v-form v-model="valid">
          <v-container>
            <v-layout justify-center row>
              <v-flex
                xs12
                md4
              >
                <v-text-field
                  :rules="usernameRules"
                  counter
                  label="Username"
                  required
                  v-model="username"
                ></v-text-field>
              </v-flex>

              <v-flex
                xs12
                md4
              >
                <v-text-field
                  :rules="passwordRules"
                  counter
                  label="Password"
                  password
                  required
                  type="password"
                  v-model="password"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-flex>

      <v-flex xs12>
          <v-btn
            @click="login"
            :disabled="!valid"
          >
            Login
          </v-btn>
          <v-btn
            @click="signUp"
            :disabled="!valid"
          >
            Sign Up
          </v-btn>
      </v-flex>
      <v-snackbar
        bottom
        :color="snackbarColor"
        :timeout="6000"
        v-model="showSnackbar"
      >
        {{ snackbarText }}
        <v-btn
          dark
          flat
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    showSnackbar: false,
    snackbarColor: 'success',
    snackbarText: '',
    password: '',
    username: '',
    valid: false,
    usernameRules: [
      v => !!v || '👀',
      v => v.length > 2 || '🔥'
    ],
    passwordRules: [
      v => !!v || '👾',
      v => v.length > 6 || '👽'
    ]
  }),
  methods: {
    snackbar(text, color) {
        this.snackbarText = text;
        this.snackbarColor = color;
        this.showSnackbar = true
    },
    async signUp() {
        if (!this.valid) return;
        try {
            const { data: user } = await this.$axios.post('/auth/new', {
                username: this.username,
                password: this.password,
            });
            this.snackbar(`Congrats, ${user.username}! You might get a ticket out of here, but it won't be easy!`);
        } catch (e) {
            const status = e.response.status;
            if (status === 422) this.snackbar(`Maybe somebody claimed to be YOU?!`, 'error');
            else this.snackbar(`Looks like you aren't gonna get on that train ✋ Hurry, you must get a ticket before it is too late!`, 'error');
        }
    },
    async login() {
        try {
            const { data: { token }} = await this.$axios.post('/auth', {
                username: this.username,
                password: this.password,
            });
            this.setApiAuthorizationHeader(token);
            this.snackbar(`Entering the ticket shop ... chew chew 🚂`);
            setTimeout(() => {
                this.$router.push('/ticket-shop');
            }, 2000);
        } catch (e) {
          const status = e.response.status;
          if (status === 401) this.snackbar(`Did you forget the one thing you were not supposed to forget?!`, 'error');
          else this.snackbar(`I don't know .. something went wrong.`, 'error');
        }
    },
    setApiAuthorizationHeader(token) {
        window.localStorage.token = token;
        this.$axios.defaults.headers.common['Authorization'] = token;
    }
  }
}
</script>
