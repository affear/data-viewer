document.querySelector('#live-template').addEventListener('template-bound', function() {

    // HTML Elements
    var template = document.querySelector('#live-template');
    var sim_live = document.querySelector('#sim-live');
    var error_message = document.querySelector('#no-running-msg');

    // Firebase references
    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');

    // Template data-binding
    template.proxies = [];


    // Chek if a sim is running
    running_ref.on('value', function(data) {
        // Running
        if (data.val()) {
            sim_live.style.display = 'block';
            error_message.style.display = 'none';
            console.log('Simulation is running');
            _showLiveSim();
        }
        // Non Running
        else {
            sim_live.style.display = 'none';
            error_message.style.display = 'block';
            console.log('No simulation is running');
        }
    });


    var _showLiveSim = function() {

        last_sim_id_ref.once('value', function(data) {

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            // Update charts
            last_sim_proxies_ref.on('child_added', function(data) {
                var new_proxy = {
                    id: data.key(),
                    val: data.val()
                }

                initLineCharts();


                template.proxies.push(new_proxy);
                // This is shit: check when the template renders the chart
                var checkExist = setTimeout(function() {
                    var new_proxy_line_chart = document.querySelector('#line-chart' + new_proxy.id);
                    var new_proxy_bar_chart = document.querySelector('#bar-chart' + new_proxy.id);

                    if (new_proxy_line_chart && new_proxy_bar_chart) {
                        initBarCharts(new_proxy.val.architecture);
                        initDropDown();
                        _update_chart(new_proxy_line_chart, new_proxy_bar_chart);
                        clearInterval(checkExist);
                    }
                }, 100);


                function _update_chart(line_chart, bar_chart) {
                    // Updating Sanpshots
                    var snapshot_count = 0;
                    new_proxy_snapshots_ref = last_sim_proxies_ref.child(new_proxy.id + '/snapshots');
                    new_proxy_snapshots_ref.once('value', function(data) {
                        // Start reading steps the last minus 10
                        var no_runned_steps = data.numChildren();
                        new_proxy_snapshots_ref.orderByKey().startAt((no_runned_steps - 10).toString()).on('child_added', function(data) {
                            var new_snapshot = {
                                id: data.key(),
                                val: data.val()
                            }

                            var new_proxy_line_chart = line_chart;
                            var new_proxy_bar_chart = bar_chart;
                            var command = new_snapshot.val.command;

                            // LINE CHART
                            // Get data
                            var avg_r_local_gb = new_snapshot.val.avg_r_local_gb * 100;
                            var avg_r_memory_mb = new_snapshot.val.avg_r_memory_mb * 100;
                            var avg_r_vcpus = new_snapshot.val.avg_r_vcpus * 100;
                            var no_active_cmps = new_snapshot.val.no_active_cmps;


                            // Add to the chart
                            new_proxy_line_chart.addData([avg_r_local_gb, avg_r_memory_mb, avg_r_vcpus, no_active_cmps], new_snapshot.id + ': ' + new_snapshot.val.command);

                            // BAR CHART
                            var cmps = new_snapshot.val.cmps;
                            var new_data = [
                                []
                            ];
                            for (var i = 0; i < cmps.length; i++) {
                                new_data[0].push(cmps[i].r_memory_mb * 100);
                            };
                            new_proxy_bar_chart.update(new_data);

                        });
                    })
                }
            });
        });
    }

    var initLineCharts = function() {
        template.lineChartInitData = {
            datasets: [{
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: "rgba(244, 67, 54, 1)",
                pointColor: "rgba(244, 67, 54, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(244, 67, 54, 1)",
            }, {
                label: "avg_r_memory_mb",
                fillColor: "rgba(62, 83, 175, 0.2)",
                strokeColor: "rgba(62, 83, 175, 1)",
                pointColor: "rgba(62, 83, 175, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(62, 83, 175, 1)",
            }, {
                label: "avg_r_vcpus",
                fillColor: "rgba(65, 174, 93, 0.2)",
                strokeColor: "rgba(65, 174, 93, 1)",
                pointColor: "rgba(65, 174, 93, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(65, 174, 93, 1)",
            }, {
                label: "cmps",
                fillColor: "rgba(255, 191, 66, 0.2)",
                strokeColor: "rgba(255, 191, 66, 1)",
                pointColor: "rgba(255, 191, 66, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255, 191, 66, 1)",
            }, ]
        };
    }

    var initBarCharts = function(architecture) {
        template.no_cmps = architecture.length;
        template.barChartInitData = {};
        template.barChartInitData.labels = [];

        var default_data = []
        for (var i = 0; i < architecture.length; i++) {
            template.barChartInitData.labels.push(architecture[i].hostname);
            default_data.push(0);
        }
        template.barChartInitData.datasets = [{
            data: default_data,
            label: "avg_r_local_gb",
            fillColor: "rgba(244, 67, 54, 0.2)",
            strokeColor: "rgba(244, 67, 54, 1)",
            pointColor: "rgba(244, 67, 54, 1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(244, 67, 54, 1)",
        }];
    }

    var initDropDown = function() {
        document.querySelector('#metric-sel').addEventListener('core-select', function(event) {
            console.log(event.detail);
        });
    }

    template.metrics = {
        selected: 'r_vcpus',
        options: [{
            name: 'Cpu',
            id: 'r_vcpus'
        }, {
            name: 'RAM',
            id: 'r_memory_mb'
        }, {
            name: 'Disk',
            id: 'r_local_gb'
        }]
    }
});
