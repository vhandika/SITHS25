
import React from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound } from 'lucide-react';

const Login: React.FC = () => {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-black py-16 px-4 mt-16 lg:mt-0">
             <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url('https://picsum.photos/seed/loginbg/1920/1080')" }}
            ></div>
            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-sm">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                         <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12 font-bold text-3xl">L</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white">Login</h1>
                    </div>
                    <p className="mt-2 text-gray-400">Access your Operator profile.</p>
                </div>
                <form className="mt-8 space-y-6" action="#" method="POST">
                    <input type="hidden" name="remember" value="true" />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-yellow-400 focus:ring-yellow-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-400">
                                Remember me
                            </label>
                        </div>

                        <div className="font-medium">
                            <a href="#" className="text-yellow-400 hover:text-yellow-300">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <SkewedButton className="w-full" icon={<KeyRound size={16}/>}>
                           Authorize
                        </SkewedButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
