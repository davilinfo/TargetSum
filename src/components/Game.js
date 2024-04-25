import React from "react";
import {View, StyleSheet, Button, Text} from 'react-native';
import PropTypes from 'prop-types';
import RandomNumber from './RandomNumber';
import shuffle from 'lodash.shuffle';

class Game extends React.Component {
    static propTypes = {
        randomNumberCount: PropTypes.number.isRequired,
        initialSeconds: PropTypes.number.isRequired,
        onPlayAgain: PropTypes.func.isRequired
    }
    state = {
        selectedIds: [],
        remainingSeconds: 10
    }

    randomNumbers = Array.from({length: this.props.randomNumberCount}).map(()=> 1 + Math.floor(10 * Math.random()));
   
    target = this.randomNumbers
            .slice(0, this.props.randomNumberCount - 2)
            .reduce((acc,curr)=> acc + curr, 0);
    
    shuffleRandomNumbers = shuffle(this.randomNumbers)

    gameStatus = 'PLAYING';

    componentDidMount(){
        this.intervalId = setInterval(()=>{
            this.setState((prevState)=> ({
                remainingSeconds: prevState.remainingSeconds - 1 
            }), 
                ()=>{
                    if (this.state.remainingSeconds === 0){
                        clearInterval(this.intervalId);
                    }
                }
            )
        }, 1000)
    }

    UNSAFE_componentWillUpdate(nextProps, nextState){ 
        if (nextState.selectedIds !== this.state.selectedIds || nextState.remainingSeconds === 0){
            this.gameStatus = this.calcGameStatus(nextState);
            if (this.gameStatus !== 'PLAYING'){
                clearInterval(this.intervalId);
            }
        }
    }

    componentWillUnmount(){
        clearInterval(this.intervalId);
    }

    isSelectedNumber = (numberIndex) => {
        return this.state.selectedIds.indexOf(numberIndex) >= 0;
    }

    selectNumber = (numberIndex) => {
        this.setState((prevState)=>({            
            selectedIds : [...prevState.selectedIds, numberIndex]
        }));        
    }

    calcGameStatus= (nextState) =>{
        const sumSelected = nextState.selectedIds.reduce((acc, curr)=>{
            return acc + this.shuffleRandomNumbers[curr]; 
        }, 0);

        if (nextState.remainingSeconds === 0){
            return 'LOST';
        }
        if (sumSelected < this.target)
        {
            return 'PLAYING';
        }
        if (sumSelected === this.target){
            return 'WON';
        }
        return 'LOST';
    }

    render(){           
        const gameStatus = this.gameStatus;             
        return (
            <View style={styles.container}>
                <Text style={[styles.target, styles[`STATUS_${gameStatus}`]]}>{this.target}</Text>
                <View style={styles.randomContainer}>     
                    {this.shuffleRandomNumbers.map((element,index)=>                      
                        <RandomNumber                             
                            onPress={this.selectNumber} 
                            id={index}
                            key={index} 
                            number={element}                            
                            isDisabled={this.isSelectedNumber(index) || gameStatus !== "PLAYING"}
                        />
                    )}                    
                </View>  
                {this.gameStatus !== 'PLAYING' && 
                    <Button
                        title="Play again"
                        onPress={this.props.onPlayAgain}
                    />
                }
                <Text>{this.state.remainingSeconds}</Text>              
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        backgroundColor: "#ddd"
    },

    target: {
        fontSize:40,
        backgroundColor:"#bbb",
        marginHorizontal:50,
        marginVertical: 50,
        textAlign:'center'
    },

    randomContainer: {        
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },

    STATUS_PLAYING: {
        backgroundColor: '#bbb'
    },

    STATUS_WON: {
        backgroundColor: '#0f0'
    },

    STATUS_LOST: {
        backgroundColor: '#f00'
    },

});

export default Game;